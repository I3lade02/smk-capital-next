"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import { z } from "zod";
import {
  IconArrowRight,
  IconCheck,
  IconFileTypePdf,
  IconLoader2,
  IconPhoto,
  IconUpload,
} from "@tabler/icons-react";
import { cn } from "@/lib/cn";

const contractReviewEndpoint =
  process.env.NEXT_PUBLIC_CONTRACT_REVIEW_ENDPOINT ??
  "https://smkcapital.cz/contract-review.php";
const contractReviewFormTimeoutMs = 20000;
const maxFileSizeBytes = 8 * 1024 * 1024;
const maxTotalFileSizeBytes = 30 * 1024 * 1024;
const maxFileCount = 10;
const acceptedFileExtensions = [".pdf", ".jpg", ".jpeg", ".png", ".webp", ".heic"];
const acceptedFileInputTypes = [
  "application/pdf",
  "image/*",
  ...acceptedFileExtensions,
];
const acceptedFileTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];
const privacyConsentText =
  "Souhlasím se zpracováním osobních údajů za účelem bezplatné revize smluv a zpětného kontaktování.";

const serviceOptions = [
  "Pojištění vozidel",
  "Pojištění majetku a domácnosti",
  "Životní a úrazové pojištění",
  "Hypotéky a úvěry",
  "Investice a spoření",
  "Energie",
  "Firemní a podnikatelská řešení",
];

type SubmitStatus =
  | { type: "idle"; message: "" }
  | { type: "success" | "error"; message: string };

type ContractReviewResponse = {
  success?: boolean;
  message?: string;
};

const contractReviewFormSchema = z
  .object({
    name: z.string().trim().max(80, "Jméno může mít maximálně 80 znaků."),
    phone: z
      .string()
      .trim()
      .min(1, "Telefon je povinný.")
      .regex(
        /^(\+420\s?)?(\d[\s.-]?){9}$/,
        "Zadejte prosím platné české telefonní číslo.",
      ),
    email: z
      .string()
      .trim()
      .min(1, "E-mail je povinný.")
      .email("Zadejte prosím platný e-mail."),
    services: z.array(z.string()).min(1, "Vyberte alespoň jednu oblast."),
    files: z
      .array(z.custom<File>((value) => value instanceof File))
      .max(maxFileCount, `Nahrajte prosím maximálně ${maxFileCount} souborů.`),
    note: z.string().trim().max(1200, "Poznámka může mít maximálně 1200 znaků."),
    website: z.string().trim(),
    privacyConsent: z.boolean().refine((value) => value, {
      message: "Pro odeslání je nutné souhlasit se zpracováním osobních údajů.",
    }),
  })
  .superRefine((values, ctx) => {
    if (values.website) {
      ctx.addIssue({
        code: "custom",
        path: ["website"],
        message: "Formulář se nepodařilo ověřit.",
      });
    }

    const totalSize = values.files.reduce((size, file) => size + file.size, 0);

    if (totalSize > maxTotalFileSizeBytes) {
      ctx.addIssue({
        code: "custom",
        path: ["files"],
        message: "Soubory mohou mít dohromady maximálně 30 MB.",
      });
    }

    values.files.forEach((file) => {
      if (!isAcceptedContractFile(file)) {
        ctx.addIssue({
          code: "custom",
          path: ["files"],
          message: "Přílohy mohou být pouze PDF nebo obrázky JPG, PNG, WEBP či HEIC.",
        });
      }

      if (file.size > maxFileSizeBytes) {
        ctx.addIssue({
          code: "custom",
          path: ["files"],
          message: "Jeden soubor může mít maximálně 8 MB.",
        });
      }
    });
  });

type ContractReviewFormValues = z.infer<typeof contractReviewFormSchema>;
type ContractReviewFormErrors = Partial<
  Record<keyof ContractReviewFormValues, string>
>;

export function ContractReviewForm() {
  const [formErrors, setFormErrors] = useState<ContractReviewFormErrors>({});
  const [status, setStatus] = useState<SubmitStatus>({
    type: "idle",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  function clearFieldError(field: keyof ContractReviewFormValues) {
    if (!formErrors[field]) {
      return;
    }

    setFormErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors[field];
      return nextErrors;
    });
  }

  function getInputClassName(field: keyof ContractReviewFormValues) {
    return formErrors[field]
      ? "input border-red-300 focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(248,113,113,0.16)]"
      : "input";
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    setSelectedFiles(files);
    clearFieldError("files");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const currentForm = event.currentTarget;
    const formData = new FormData(currentForm);
    const files = formData
      .getAll("contracts")
      .filter((file): file is File => file instanceof File && file.size > 0);
    const services = formData.getAll("services").map((value) => value.toString());

    const formValues: ContractReviewFormValues = {
      name: formData.get("name")?.toString() ?? "",
      phone: formData.get("phone")?.toString() ?? "",
      email: formData.get("email")?.toString() ?? "",
      services,
      files,
      note: formData.get("note")?.toString() ?? "",
      website: formData.get("website")?.toString() ?? "",
      privacyConsent: formData.get("privacyConsent") === "true",
    };

    const validationResult = contractReviewFormSchema.safeParse(formValues);

    if (!validationResult.success) {
      setFormErrors(getContractReviewFormErrors(validationResult.error));
      setStatus({
        type: "error",
        message: "Zkontrolujte prosím zvýrazněná pole ve formuláři.",
      });
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);
    setStatus({ type: "idle", message: "" });

    const { name, phone, email, note, website, privacyConsent } =
      validationResult.data;

    formData.set("name", name);
    formData.set("phone", phone);
    formData.set("email", email);
    formData.set("note", note);
    formData.set("website", website);
    formData.set("privacyConsent", privacyConsent ? "true" : "false");
    formData.set("privacyConsentText", privacyConsentText);
    formData.set("privacyConsentAt", new Date().toISOString());
    formData.set("serviceSummary", services.join(", "));

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      controller.abort();
    }, contractReviewFormTimeoutMs);

    try {
      const response = await fetch(contractReviewEndpoint, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      const { data, hasInvalidJson } =
        await readContractReviewResponse(response);

      if (!response.ok || data?.success === false) {
        throw new Error(getServerErrorMessage(response, data?.message));
      }

      if (hasInvalidJson) {
        throw new Error(
          "Revizi se nepodařilo potvrdit, protože server vrátil nečitelnou odpověď. Zkuste to prosím znovu.",
        );
      }

      setStatus({
        type: "success",
        message: data?.message ?? "Požadavek na revizi smluv byl úspěšně odeslán.",
      });
      currentForm.reset();
      setSelectedFiles([]);
    } catch (error) {
      setStatus({
        type: "error",
        message: getSubmitErrorMessage(error),
      });
    } finally {
      window.clearTimeout(timeoutId);
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="grid gap-5 rounded-[28px] bg-white p-6 text-[#061a34] shadow-[0_30px_80px_rgba(0,0,0,0.22)] md:p-8"
      onSubmit={handleSubmit}
      noValidate
    >
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#c89750]">
          Nezávazná revize
        </p>
        <h2 className="mt-3 font-serif text-4xl leading-tight">
          Vyzkoušejte, jestli lze ušetřit a vylepšit krytí.
        </h2>
        <p className="mt-4 text-sm leading-6 text-[#061a34]/60">
          Nahrajte PDF nebo fotografie smluv. Zkontrolujeme cenu, podmínky,
          krytí a upozorníme vás na případná rizika.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2 md:col-span-2">
          <label htmlFor="name" className="text-sm font-semibold">
            Jméno
          </label>
          <input
            id="name"
            name="name"
            className={getInputClassName("name")}
            placeholder="Vaše jméno"
            autoComplete="name"
            onInput={() => clearFieldError("name")}
          />
          {formErrors.name ? (
            <p className="text-xs font-medium text-red-700">
              {formErrors.name}
            </p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <label htmlFor="phone" className="text-sm font-semibold">
            Telefon
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            className={getInputClassName("phone")}
            placeholder="+420 777 123 456"
            autoComplete="tel"
            onInput={() => clearFieldError("phone")}
          />
          {formErrors.phone ? (
            <p className="text-xs font-medium text-red-700">
              {formErrors.phone}
            </p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <label htmlFor="email" className="text-sm font-semibold">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className={getInputClassName("email")}
            placeholder="vas@email.cz"
            autoComplete="email"
            onInput={() => clearFieldError("email")}
          />
          {formErrors.email ? (
            <p className="text-xs font-medium text-red-700">
              {formErrors.email}
            </p>
          ) : null}
        </div>
      </div>

      <fieldset className="grid gap-3">
        <legend className="text-sm font-semibold text-[#061a34]">
          Jaké služby aktuálně využíváte?
        </legend>

        <div className="grid gap-3 sm:grid-cols-2">
          {serviceOptions.map((option) => (
            <label
              key={option}
              className="flex items-start gap-3 rounded-2xl border border-[#061a34]/10 bg-[#fbf8f3] px-4 py-3 text-sm leading-6 text-[#061a34]/74 transition hover:border-[#c89750]/45 hover:bg-[#f7f0e6]"
            >
              <input
                type="checkbox"
                name="services"
                value={option}
                className="mt-1 size-4 rounded border-[#061a34]/25 accent-[#061a34]"
                onChange={() => clearFieldError("services")}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
        {formErrors.services ? (
          <p className="text-xs font-medium text-red-700">
            {formErrors.services}
          </p>
        ) : null}
      </fieldset>

      <div className="grid gap-2">
        <label
          htmlFor="contracts"
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed bg-[#fbf8f3] px-5 py-8 text-center transition hover:border-[#c89750] hover:bg-[#f7f0e6]",
            formErrors.files ? "border-red-300" : "border-[#c89750]/45",
          )}
        >
          <span className="flex size-14 items-center justify-center rounded-2xl bg-[#061a34] text-[#f1c47d]">
            {selectedFiles.some((file) => isPdfFile(file)) ? (
              <IconFileTypePdf size={26} stroke={1.7} aria-hidden="true" />
            ) : selectedFiles.length > 0 ? (
              <IconPhoto size={26} stroke={1.7} aria-hidden="true" />
            ) : (
              <IconUpload size={25} stroke={1.7} aria-hidden="true" />
            )}
          </span>
          <span className="mt-4 text-sm font-semibold">
            {selectedFiles.length > 0
              ? `${selectedFiles.length} vybraných souborů`
              : "Nahrát smlouvy v PDF nebo jako fotografie (nepovinné)"}
          </span>
          <span className="mt-2 max-w-md text-xs leading-5 text-[#061a34]/55">
            PDF, JPG, PNG, WEBP nebo HEIC. Maximálně {maxFileCount} souborů,
            8 MB na soubor a 30 MB dohromady.
          </span>
          <input
            id="contracts"
            name="contracts"
            type="file"
            accept={acceptedFileInputTypes.join(",")}
            className="sr-only"
            multiple
            onChange={handleFileChange}
          />
        </label>
        {selectedFiles.length > 0 ? (
          <ul className="grid gap-2 rounded-2xl border border-[#061a34]/10 bg-white p-3 text-sm text-[#061a34]/70">
            {selectedFiles.map((file) => (
              <li key={`${file.name}-${file.size}`} className="flex gap-3">
                <IconCheck
                  size={17}
                  strokeWidth={2.1}
                  className="mt-0.5 shrink-0 text-[#c89750]"
                  aria-hidden="true"
                />
                <span className="min-w-0 wrap-break-word">
                  {file.name} ({formatFileSize(file.size)})
                </span>
              </li>
            ))}
          </ul>
        ) : null}
        {formErrors.files ? (
          <p className="text-xs font-medium text-red-700">
            {formErrors.files}
          </p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <label htmlFor="note" className="text-sm font-semibold">
          Poznámka
        </label>
        <textarea
          id="note"
          name="note"
          className={cn(getInputClassName("note"), "min-h-30 resize-none")}
          placeholder="Můžete doplnit, co chcete zkontrolovat přednostně."
          onInput={() => clearFieldError("note")}
        />
        {formErrors.note ? (
          <p className="text-xs font-medium text-red-700">
            {formErrors.note}
          </p>
        ) : null}
      </div>

      <input
        type="text"
        name="website"
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <div className="grid gap-2">
        <label
          className={
            formErrors.privacyConsent
              ? "flex items-start gap-3 rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm leading-6 text-red-900"
              : "flex items-start gap-3 rounded-2xl border border-[#061a34]/10 bg-[#fbf8f3] px-4 py-3 text-sm leading-6 text-[#061a34]/70"
          }
        >
          <input
            type="checkbox"
            name="privacyConsent"
            value="true"
            required
            className="mt-1 size-4 rounded border-[#061a34]/25 accent-[#061a34]"
            aria-invalid={Boolean(formErrors.privacyConsent)}
            onChange={() => clearFieldError("privacyConsent")}
          />
          <span>{privacyConsentText}</span>
        </label>
        {formErrors.privacyConsent ? (
          <p className="text-xs font-medium text-red-700">
            {formErrors.privacyConsent}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <p className="text-sm leading-6 text-[#061a34]/55">
          Soubory slouží pouze k vyřízení revize a nejsou veřejně sdílené.
        </p>

        <button
          type="submit"
          disabled={isSubmitting}
          className="contact-submit-button relative inline-flex min-w-48 items-center justify-center gap-3 overflow-hidden rounded-full bg-[#061a34] px-7 py-4 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(6,26,52,0.18)] transition hover:bg-[#0b274b] disabled:cursor-not-allowed disabled:opacity-80"
          data-state={
            isSubmitting
              ? "loading"
              : status.type === "success"
                ? "success"
                : "idle"
          }
        >
          <span className="contact-submit-shine" aria-hidden="true" />
          <span className="relative z-10">
            {isSubmitting
              ? "Odesílám..."
              : status.type === "success"
                ? "Odesláno"
                : "Odeslat revizi"}
          </span>
          <span className="relative z-10 flex size-5 items-center justify-center">
            {isSubmitting ? (
              <IconLoader2
                className="contact-submit-spinner"
                size={18}
                stroke={1.9}
                aria-hidden="true"
              />
            ) : status.type === "success" ? (
              <IconCheck size={18} stroke={2.1} aria-hidden="true" />
            ) : (
              <IconArrowRight size={17} stroke={1.8} aria-hidden="true" />
            )}
          </span>
        </button>
      </div>

      {status.type !== "idle" ? (
        <div
          aria-live="polite"
          className={
            status.type === "success"
              ? "rounded-3xl border border-green-200 bg-green-50 p-5 text-green-900 shadow-[0_16px_38px_rgba(15,122,79,0.1)]"
              : "rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
          }
        >
          {status.type === "success" ? (
            <div className="flex gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-green-600 text-white">
                <IconCheck size={22} stroke={2.2} aria-hidden="true" />
              </div>
              <div>
                <p className="font-serif text-2xl leading-tight">
                  Revizi jsme přijali.
                </p>
                <p className="mt-2 text-sm leading-6 text-green-900/75">
                  Ozveme se vám s analýzou ceny, krytí a možných úprav.
                </p>
              </div>
            </div>
          ) : (
            status.message
          )}
        </div>
      ) : null}
    </form>
  );
}

async function readContractReviewResponse(response: Response) {
  const responseText = await response.text();

  if (responseText.trim() === "") {
    return {
      data: null,
      hasInvalidJson: response.ok,
    };
  }

  try {
    return {
      data: JSON.parse(responseText) as ContractReviewResponse,
      hasInvalidJson: false,
    };
  } catch {
    return {
      data: null,
      hasInvalidJson: response.ok,
    };
  }
}

function getContractReviewFormErrors(
  error: z.ZodError<ContractReviewFormValues>,
) {
  return error.issues.reduce<ContractReviewFormErrors>((errors, issue) => {
    const fieldName = issue.path[0];

    if (typeof fieldName !== "string") {
      return errors;
    }

    const typedFieldName = fieldName as keyof ContractReviewFormValues;

    if (!errors[typedFieldName]) {
      errors[typedFieldName] = issue.message;
    }

    return errors;
  }, {});
}

function getServerErrorMessage(response: Response, serverMessage?: string) {
  const messageFromServer = serverMessage?.trim();

  if (messageFromServer) {
    return messageFromServer;
  }

  if (response.status === 400) {
    return "Revizi se nepodařilo odeslat, protože formulář obsahuje neplatné údaje.";
  }

  if (response.status === 413) {
    return "Přílohy jsou příliš velké. Zmenšete je prosím nebo pošlete méně souborů.";
  }

  if (response.status === 415) {
    return "Přílohy musí být PDF nebo obrázky.";
  }

  if (response.status >= 500) {
    return "Revizi se nepodařilo odeslat kvůli chybě serveru. Zkuste to prosím později.";
  }

  return "Revizi se nepodařilo odeslat. Zkuste to prosím znovu.";
}

function getSubmitErrorMessage(error: unknown) {
  if (error instanceof DOMException && error.name === "AbortError") {
    return "Server neodpověděl včas. Zkontrolujte připojení a zkuste to znovu.";
  }

  if (error instanceof TypeError) {
    return "Nepodařilo se spojit se serverem. Může jít o nedostupný endpoint nebo CORS nastavení.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Revizi se nepodařilo odeslat z neznámého důvodu.";
}

function isAcceptedContractFile(file: File) {
  const fileName = file.name.toLocaleLowerCase("cs-CZ");

  return (
    acceptedFileTypes.includes(file.type) ||
    acceptedFileExtensions.some((extension) => fileName.endsWith(extension))
  );
}

function isPdfFile(file: File) {
  return (
    file.type === "application/pdf" ||
    file.name.toLocaleLowerCase("cs-CZ").endsWith(".pdf")
  );
}

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.ceil(size / 1024)} kB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
