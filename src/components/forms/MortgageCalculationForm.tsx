"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { z } from "zod";
import {
  IconArrowRight,
  IconCheck,
  IconLoader2,
} from "@tabler/icons-react";
import { cn } from "@/lib/cn";

const mortgageCalculationEndpoint =
  process.env.NEXT_PUBLIC_MORTGAGE_CALCULATION_ENDPOINT ??
  "https://smkcapital.cz/mortgage-calculation.php";
const mortgageCalculationTimeoutMs = 15000;
const maxFinancialValue = 10_000_000;
const privacyConsentText =
  "Souhlasím se zpracováním osobních údajů za účelem vyřízení žádosti a zpětného kontaktování.";

type SubmitStatus =
  | { type: "idle"; message: "" }
  | { type: "success" | "error"; message: string };

type MortgageCalculationResponse = {
  success?: boolean;
  message?: string;
};

const mortgageCalculationFormSchema = z.object({
  loanYears: z
    .string()
    .trim()
    .min(1, "Doba splatnosti je povinná.")
    .regex(/^\d+$/, "Doba splatnosti musí být celé číslo.")
    .transform((value) => Number(value))
    .refine((value) => value >= 1 && value <= 40, {
      message: "Doba splatnosti musí být mezi 1 a 40 lety.",
    }),
  monthlyIncome: createFinancialFieldSchema(
    "Příjmy jsou povinné.",
    "Příjmy musí být kladné číslo.",
    true,
  ),
  borrowAmount: createFinancialFieldSchema(
    "Částka je povinná.",
    "Částka musí být celé číslo.",
    false,
  ),
  otherObligations: createFinancialFieldSchema(
    "Jiné závazky jsou povinné.",
    "Jiné závazky musí být nula nebo kladné číslo.",
    false,
  ),
  email: z
    .string()
    .trim()
    .min(1, "E-mail je povinný.")
    .email("Zadejte prosím platný e-mail."),
  phone: z
    .string()
    .trim()
    .min(1, "Telefon je povinný.")
    .regex(
      /^(\+420\s?)?(\d[\s.-]?){9}$/,
      "Zadejte prosím platné české telefonní číslo.",
    ),
  website: z.string().trim(),
  privacyConsent: z.boolean().refine((value) => value, {
    message: "Pro odeslání je nutné souhlasit se zpracováním osobních údajů.",
  }),
});

type MortgageCalculationFormValues = z.infer<
  typeof mortgageCalculationFormSchema
>;
type MortgageCalculationFormErrors = Partial<
  Record<keyof MortgageCalculationFormValues, string>
>;

const fieldErrorKeys = [
  "loanYears",
  "monthlyIncome",
  "borrowAmount",
  "otherObligations",
  "email",
  "phone",
  "website",
  "privacyConsent",
] as const;

type MortgageCalculationField = (typeof fieldErrorKeys)[number];

export function MortgageCalculationForm() {
  const [formErrors, setFormErrors] =
    useState<MortgageCalculationFormErrors>({});
  const [status, setStatus] = useState<SubmitStatus>({
    type: "idle",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  function clearFieldError(field: MortgageCalculationField) {
    if (!formErrors[field]) {
      return;
    }

    setFormErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors[field];
      return nextErrors;
    });
  }

  function getInputClassName(field: MortgageCalculationField) {
    return formErrors[field]
      ? "input border-red-300 focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(248,113,113,0.16)]"
      : "input";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const currentForm = event.currentTarget;
    const formData = new FormData(currentForm);

    const validationResult = mortgageCalculationFormSchema.safeParse({
      loanYears: formData.get("loanYears")?.toString() ?? "",
      monthlyIncome: formData.get("monthlyIncome")?.toString() ?? "",
      monthlyPayment: formData.get("monthlyPayment")?.toString() ?? "",
      otherObligations: formData.get("otherObligations")?.toString() ?? "",
      email: formData.get("email")?.toString() ?? "",
      phone: formData.get("phone")?.toString() ?? "",
      website: formData.get("website")?.toString() ?? "",
      privacyConsent: formData.get("privacyConsent") === "true",
    });

    if (!validationResult.success) {
      setFormErrors(getMortgageCalculationFormErrors(validationResult.error));
      setStatus({
        type: "error",
        message: "Zkontrolujte prosím zvýrazněná pole ve formuláři.",
      });
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);
    setStatus({ type: "idle", message: "" });

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      controller.abort();
    }, mortgageCalculationTimeoutMs);

    try {
      const response = await fetch(mortgageCalculationEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify(validationResult.data),
      });

      const { data, hasInvalidJson } =
        await readMortgageCalculationResponse(response);

      if (!response.ok || data?.success === false) {
        throw new Error(getServerErrorMessage(response, data?.message));
      }

      if (hasInvalidJson) {
        throw new Error(
          "Žádost se nepodařilo potvrdit, protože server vrátil nečitelnou odpověď. Zkuste to prosím znovu.",
        );
      }

      setStatus({
        type: "success",
        message:
          data?.message ??
          "Žádost o hypoteční propočet byla úspěšně odeslána.",
      });
      currentForm.reset();
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
          Orientační propočet
        </p>
        <h2 className="mt-3 font-serif text-4xl leading-tight">
          Základní údaje k hypotéce.
        </h2>
        <p className="mt-4 text-sm leading-6 text-[#061a34]/60">
          Údaje slouží pouze k přípravě orientačního hypotečního propočtu a ke
          zpětnému kontaktování. Nejde o závaznou kalkulaci ani úvěrové
          schválení.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <label htmlFor="loanYears" className="text-sm font-semibold">
            Na kolik let
          </label>
          <div className="relative">
            <input
              id="loanYears"
              name="loanYears"
              type="number"
              min="1"
              max="40"
              step="1"
              className={cn(getInputClassName("loanYears"), "pr-14")}
              placeholder="25"
              onInput={() => clearFieldError("loanYears")}
            />
            <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-semibold text-[#061a34]/45">
              let
            </span>
          </div>
          {formErrors.loanYears ? (
            <p className="text-xs font-medium text-red-700">
              {formErrors.loanYears}
            </p>
          ) : null}
        </div>

        <MoneyField
          id="monthlyIncome"
          label="Příjmy"
          placeholder="60000"
          error={formErrors.monthlyIncome}
          inputClassName={getInputClassName("monthlyIncome")}
          onInput={() => clearFieldError("monthlyIncome")}
        />

        <MoneyField
          id="borrowAmount"
          label="Kolik si chcete půjčit ?"
          placeholder="18000"
          error={formErrors.borrowAmount}
          inputClassName={getInputClassName("borrowAmount")}
          onInput={() => clearFieldError("borrowAmount")}
        />

        <MoneyField
          id="otherObligations"
          label="Jiné závazky"
          placeholder="5000"
          error={formErrors.otherObligations}
          inputClassName={getInputClassName("otherObligations")}
          onInput={() => clearFieldError("otherObligations")}
        />

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
      </div>

      <input
        type="text"
        name="website"
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <div className="rounded-2xl border border-[#c89750]/25 bg-[#fbf8f3] px-4 py-3 text-sm leading-6 text-[#061a34]/65">
        Informace použijeme jen k přípravě orientačního propočtu a ke
        kontaktování ohledně vaší žádosti.
      </div>

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
          Částky zadávejte bez mezer a bez symbolu Kč, například 60000.
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
                : "Odeslat žádost"}
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
                  Žádost jsme přijali.
                </p>
                <p className="mt-2 text-sm leading-6 text-green-900/75">
                  Ozveme se vám s orientačními možnostmi a případně doplníme
                  chybějící údaje.
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

type MoneyFieldProps = {
  id: "monthlyIncome" | "borrowAmount" | "otherObligations";
  label: string;
  placeholder: string;
  error?: string;
  inputClassName: string;
  onInput: () => void;
};

function MoneyField({
  id,
  label,
  placeholder,
  error,
  inputClassName,
  onInput,
}: MoneyFieldProps) {
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type="number"
          min="0"
          max={maxFinancialValue}
          step="100"
          className={cn(inputClassName, "pr-14")}
          placeholder={placeholder}
          onInput={onInput}
        />
        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-semibold text-[#061a34]/45">
          Kč
        </span>
      </div>
      {error ? <p className="text-xs font-medium text-red-700">{error}</p> : null}
    </div>
  );
}

async function readMortgageCalculationResponse(response: Response) {
  const responseText = await response.text();

  if (responseText.trim() === "") {
    return {
      data: null,
      hasInvalidJson: response.ok,
    };
  }

  try {
    return {
      data: JSON.parse(responseText) as MortgageCalculationResponse,
      hasInvalidJson: false,
    };
  } catch {
    return {
      data: null,
      hasInvalidJson: response.ok,
    };
  }
}

function getMortgageCalculationFormErrors(
  error: z.ZodError<MortgageCalculationFormValues>,
) {
  return error.issues.reduce<MortgageCalculationFormErrors>((errors, issue) => {
    const fieldName = issue.path[0];

    if (typeof fieldName !== "string") {
      return errors;
    }

    const typedFieldName = fieldName as MortgageCalculationField;

    if (fieldErrorKeys.includes(typedFieldName) && !errors[typedFieldName]) {
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
    return "Žádost se nepodařilo odeslat, protože formulář obsahuje neplatné údaje.";
  }

  if (response.status === 413) {
    return "Žádost je příliš velká. Zkraťte prosím zadané hodnoty a zkuste to znovu.";
  }

  if (response.status >= 500) {
    return "Žádost se nepodařilo odeslat kvůli chybě serveru. Zkuste to prosím později.";
  }

  return "Žádost se nepodařilo odeslat. Zkuste to prosím znovu.";
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

  return "Žádost se nepodařilo odeslat z neznámého důvodu.";
}

function createFinancialFieldSchema(
  requiredMessage: string,
  invalidMessage: string,
  mustBePositive: boolean,
) {
  return z
    .string()
    .trim()
    .min(1, requiredMessage)
    .refine((value) => isStrictFinancialNumber(value), {
      message: invalidMessage,
    })
    .transform((value) => normalizeFinancialValue(value))
    .refine((value) => (mustBePositive ? value > 0 : value >= 0), {
      message: invalidMessage,
    })
    .refine((value) => value <= maxFinancialValue, {
      message: "Částka může být maximálně 10 000 000 Kč.",
    });
}

function isStrictFinancialNumber(value: string) {
  return /^\d+([.,]\d{1,2})?$/.test(value);
}

function normalizeFinancialValue(value: string) {
  return Number(value.replace(",", "."));
}
