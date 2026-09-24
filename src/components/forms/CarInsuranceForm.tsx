"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import { z } from "zod";
import {
  IconArrowRight,
  IconCheck,
  IconFileTypePdf,
  IconLoader2,
  IconUpload,
} from "@tabler/icons-react";
import { cn } from "@/lib/cn";

const carInsuranceEndpoint =
  process.env.NEXT_PUBLIC_CAR_INSURANCE_ENDPOINT ??
  "https://smkcapital.cz/car-insurance.php";
const carInsuranceFormTimeoutMs = 15000;
const maxPdfSizeBytes = 8 * 1024 * 1024;
const privacyConsentText =
  "Souhlasím se zpracováním osobních údajů za účelem vyřízení poptávky a zpětného kontaktování.";

type SubmitStatus =
  | { type: "idle"; message: "" }
  | { type: "success" | "error"; message: string };

type CarInsuranceResponse = {
  success?: boolean;
  message?: string;
};

const carInsuranceFormSchema = z
  .object({
    spz: z.string().trim().min(1, "SPZ je povinná."),
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
    insurancePdf: z.custom<File | null>(
      (value) => value === null || value instanceof File,
    ),
    website: z.string().trim(),
    privacyConsent: z.boolean().refine((value) => value, {
      message: "Pro odeslání je nutné souhlasit se zpracováním osobních údajů.",
    }),
  })
  .superRefine((values, ctx) => {
    const file = values.insurancePdf;

    if (!file) {
      return;
    }

    if (!isPdfFile(file)) {
      ctx.addIssue({
        code: "custom",
        path: ["insurancePdf"],
        message: "Příloha musí být soubor PDF.",
      });
    }

    if (file.size > maxPdfSizeBytes) {
      ctx.addIssue({
        code: "custom",
        path: ["insurancePdf"],
        message: "PDF může mít maximálně 8 MB.",
      });
    }
  });

type CarInsuranceFormValues = z.infer<typeof carInsuranceFormSchema>;
type CarInsuranceFormErrors = Partial<
  Record<keyof CarInsuranceFormValues, string>
>;

export function CarInsuranceForm() {
  const [formErrors, setFormErrors] = useState<CarInsuranceFormErrors>({});
  const [status, setStatus] = useState<SubmitStatus>({
    type: "idle",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState("");

  function clearFieldError(field: keyof CarInsuranceFormValues) {
    if (!formErrors[field]) {
      return;
    }

    setFormErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors[field];
      return nextErrors;
    });
  }

  function getInputClassName(field: keyof CarInsuranceFormValues) {
    return formErrors[field]
      ? "input border-red-300 focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(248,113,113,0.16)]"
      : "input";
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setSelectedFileName(file?.name ?? "");
    clearFieldError("insurancePdf");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const currentForm = event.currentTarget;
    const formData = new FormData(currentForm);
    const rawFile = formData.get("insurancePdf");
    const insurancePdf =
      rawFile instanceof File && rawFile.size > 0 ? rawFile : null;

    const formValues: CarInsuranceFormValues = {
      spz: formData.get("spz")?.toString() ?? "",
      phone: formData.get("phone")?.toString() ?? "",
      email: formData.get("email")?.toString() ?? "",
      insurancePdf,
      website: formData.get("website")?.toString() ?? "",
      privacyConsent: formData.get("privacyConsent") === "true",
    };

    const validationResult = carInsuranceFormSchema.safeParse(formValues);

    if (!validationResult.success) {
      setFormErrors(getCarInsuranceFormErrors(validationResult.error));
      setStatus({
        type: "error",
        message: "Zkontrolujte prosím zvýrazněná pole ve formuláři.",
      });
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);
    setStatus({ type: "idle", message: "" });

    const { spz, phone, email, website, privacyConsent } =
      validationResult.data;
    formData.set("spz", spz);
    formData.set("phone", phone);
    formData.set("email", email);
    formData.set("website", website);
    formData.set("privacyConsent", privacyConsent ? "true" : "false");

    if (insurancePdf) {
      formData.set("insurancePdf", insurancePdf);
    } else {
      formData.delete("insurancePdf");
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      controller.abort();
    }, carInsuranceFormTimeoutMs);

    try {
      const response = await fetch(carInsuranceEndpoint, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      const { data, hasInvalidJson } =
        await readCarInsuranceResponse(response);

      if (!response.ok || data?.success === false) {
        throw new Error(getServerErrorMessage(response, data?.message));
      }

      if (hasInvalidJson) {
        throw new Error(
          "Poptávku se nepodařilo potvrdit, protože server vrátil nečitelnou odpověď. Zkuste to prosím znovu.",
        );
      }

      setStatus({
        type: "success",
        message:
          data?.message ??
          "Poptávka autopojištění byla úspěšně odeslána.",
      });
      currentForm.reset();
      setSelectedFileName("");
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
      className="grid gap-5 rounded-[28px] bg-white p-6 text-[#061a34] shadow-[0_30px_80px_rgba(0,0,0,0.24)] md:p-8"
      onSubmit={handleSubmit}
      noValidate
    >
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#c89750]">
          Nezávazná poptávka
        </p>
        <h2 className="mt-3 font-serif text-4xl leading-tight">
          Autopojištění podle vaší SPZ.
        </h2>
        <p className="mt-4 text-sm leading-6 text-[#061a34]/60">
          Přiložení aktuální smlouvy je nepovinné, ale pomůže nám rychleji
          porovnat limity, cenu a nastavení pojištění.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2 md:col-span-2">
          <label htmlFor="spz" className="text-sm font-semibold">
            SPZ
          </label>
          <input
            id="spz"
            name="spz"
            className={cn(getInputClassName("spz"), "uppercase")}
            placeholder="Např. 1AB 2345"
            autoComplete="off"
            onInput={() => clearFieldError("spz")}
          />
          {formErrors.spz ? (
            <p className="text-xs font-medium text-red-700">
              {formErrors.spz}
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

      <div className="grid gap-2">
        <label
          htmlFor="insurancePdf"
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed bg-[#fbf8f3] px-5 py-7 text-center transition hover:border-[#c89750] hover:bg-[#f7f0e6]",
            formErrors.insurancePdf
              ? "border-red-300"
              : "border-[#c89750]/45",
          )}
        >
          <span className="flex size-14 items-center justify-center rounded-2xl bg-[#061a34] text-[#f1c47d]">
            {selectedFileName ? (
              <IconFileTypePdf size={26} stroke={1.7} />
            ) : (
              <IconUpload size={25} stroke={1.7} />
            )}
          </span>
          <span className="mt-4 text-sm font-semibold">
            {selectedFileName || "Přiložit aktuální smlouvu v PDF"}
          </span>
          <span className="mt-2 max-w-sm text-xs leading-5 text-[#061a34]/55">
            Nepovinné. PDF do 8 MB nám pomůže rychleji připravit srovnání.
          </span>
          <input
            id="insurancePdf"
            name="insurancePdf"
            type="file"
            accept="application/pdf,.pdf"
            className="sr-only"
            onChange={handleFileChange}
          />
        </label>
        {formErrors.insurancePdf ? (
          <p className="text-xs font-medium text-red-700">
            {formErrors.insurancePdf}
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
          PDF neposíláme nikam veřejně. Slouží pouze k vyřízení poptávky.
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
                : "Odeslat poptávku"}
          </span>
          <span className="relative z-10 flex size-5 items-center justify-center">
            {isSubmitting ? (
              <IconLoader2
                className="contact-submit-spinner"
                size={18}
                stroke={1.9}
              />
            ) : status.type === "success" ? (
              <IconCheck size={18} stroke={2.1} />
            ) : (
              <IconArrowRight size={17} stroke={1.8} />
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
                <IconCheck size={22} stroke={2.2} />
              </div>
              <div>
                <p className="font-serif text-2xl leading-tight">
                  Poptávku jsme přijali.
                </p>
                <p className="mt-2 text-sm leading-6 text-green-900/75">
                  Ozveme se vám s dalšími kroky. Pokud jste přiložili PDF,
                  zpracujeme ho jen pro účely této poptávky.
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

async function readCarInsuranceResponse(response: Response) {
  const responseText = await response.text();

  if (responseText.trim() === "") {
    return {
      data: null,
      hasInvalidJson: response.ok,
    };
  }

  try {
    return {
      data: JSON.parse(responseText) as CarInsuranceResponse,
      hasInvalidJson: false,
    };
  } catch {
    return {
      data: null,
      hasInvalidJson: response.ok,
    };
  }
}

function getCarInsuranceFormErrors(
  error: z.ZodError<CarInsuranceFormValues>,
) {
  return error.issues.reduce<CarInsuranceFormErrors>((errors, issue) => {
    const fieldName = issue.path[0];

    if (typeof fieldName !== "string") {
      return errors;
    }

    const typedFieldName = fieldName as keyof CarInsuranceFormValues;

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
    return "Poptávku se nepodařilo odeslat, protože formulář obsahuje neplatné údaje.";
  }

  if (response.status === 413) {
    return "Příloha je příliš velká. Nahrajte prosím PDF do 8 MB.";
  }

  if (response.status === 415) {
    return "Příloha musí být PDF.";
  }

  if (response.status >= 500) {
    return "Poptávku se nepodařilo odeslat kvůli chybě serveru. Zkuste to prosím později.";
  }

  return "Poptávku se nepodařilo odeslat. Zkuste to prosím znovu.";
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

  return "Poptávku se nepodařilo odeslat z neznámého důvodu.";
}

function isPdfFile(file: File) {
  return (
    file.type === "application/pdf" ||
    file.name.toLocaleLowerCase("cs-CZ").endsWith(".pdf")
  );
}
