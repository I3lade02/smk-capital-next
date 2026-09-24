"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { z } from "zod";
import {
  IconArrowRight,
  IconCheck,
  IconLoader2,
  IconMail,
  IconMapPin,
  IconPhone,
} from "@tabler/icons-react";
import { contact, site } from "@/lib/content";

const contactFormEndpoint =
  process.env.NEXT_PUBLIC_CONTACT_FORM_ENDPOINT ?? "/contact.php";
const contactFormTimeoutMs = 15000;
const defaultCallPreference = "immediately";
const scheduledCallLeadTimeMinutes = 5;
const scheduledCallIntervalMinutes = 15;
const scheduledCallStartHour = 8;
const scheduledCallEndHour = 20;
const privacyConsentText = contact.privacyConsentText;

type CallPreference = "immediately" | "scheduled";

type SubmitStatus =
  | { type: "idle"; message: "" }
  | { type: "success" | "error"; message: string };

type ContactFormSubmitEvent = {
  preventDefault: () => void;
  currentTarget: HTMLFormElement;
};

type ContactFormResponse = {
  success?: boolean;
  message?: string;
};

const contactFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .max(80, "Jméno může mít maximálně 80 znaků."),

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

    service: z.string().trim().min(1, "Vyberte prosím službu."),

    message: z.string().trim(),

    website: z.string().trim(),

    callPreference: z.enum(["immediately", "scheduled"]),

    callbackDate: z.string().trim(),
    callbackTime: z.string().trim(),

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

    if (values.callPreference !== "scheduled") {
      return;
    }

    if (!values.callbackDate) {
      ctx.addIssue({
        code: "custom",
        path: ["callbackDate"],
        message: "Vyberte prosím datum hovoru.",
      });
    }

    if (!values.callbackTime) {
      ctx.addIssue({
        code: "custom",
        path: ["callbackTime"],
        message: "Vyberte prosím čas hovoru.",
      });
    }

    const callbackAt = combineScheduledCallDateTime(
      values.callbackDate,
      values.callbackTime,
    );

    if (callbackAt && !isValidScheduledCallDateTime(callbackAt)) {
      ctx.addIssue({
        code: "custom",
        path: ["callbackTime"],
        message:
          "Vyberte prosím platný budoucí termín v rozmezí 08:00 až 20:00.",
      });
    }
  });

type ContactFormValues = z.infer<typeof contactFormSchema>;

type ContactFormErrors = Partial<Record<keyof ContactFormValues, string>>;

export function ContactSection() {
  const hasAddress = site.address.length > 0;
  const [status, setStatus] = useState<SubmitStatus>({
    type: "idle",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<ContactFormErrors>({});
  const [callPreference, setCallPreference] =
    useState<CallPreference>(defaultCallPreference);
  const [scheduledCallDate, setScheduledCallDate] = useState("");
  const [scheduledCallTime, setScheduledCallTime] = useState("");
  const availableScheduledTimeOptions = getAvailableScheduledTimeOptions();

  function clearFieldError(field: keyof ContactFormValues) {
    if (!formErrors[field]) {
      return;
    }

    setFormErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors[field];
      return nextErrors;
    });
  }

  function getInputClassName(field: keyof ContactFormValues) {
    return formErrors[field]
      ? "input border-red-300 focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(248,113,113,0.16)]"
      : "input";
  }

  async function handleSubmit(event: ContactFormSubmitEvent) {
    event.preventDefault();

    const currentForm = event.currentTarget;
    const form = new FormData(currentForm);

    const selectedCallPreference = getCallPreference(
      form.get("callPreference")?.toString(),
    );

    const formValues: ContactFormValues = {
      name: form.get("name")?.toString() ?? "",
      phone: form.get("phone")?.toString() ?? "",
      email: form.get("email")?.toString() ?? "",
      service: form.get("service")?.toString() ?? "",
      message: form.get("message")?.toString() ?? "",
      website: form.get("website")?.toString() ?? "",
      callPreference: selectedCallPreference,
      callbackDate: form.get("callbackDate")?.toString() ?? "",
      callbackTime: form.get("callbackTime")?.toString() ?? "",
      privacyConsent: form.get("privacyConsent") === "true",
    };

    const validationResult = contactFormSchema.safeParse(formValues);

    if (!validationResult.success) {
      setFormErrors(getContactFormErrors(validationResult.error));
      setStatus({
        type: "error",
        message: "Zkontrolujte prosím zvýrazněná pole ve formuláři.",
      });
      return;
    }

    setFormErrors({});

    const {
      name,
      phone,
      email,
      service,
      message,
      website,
      callPreference: validatedCallPreference,
      callbackDate,
      callbackTime,
      privacyConsent,
    } = validationResult.data;

    const callbackAt = combineScheduledCallDateTime(callbackDate, callbackTime);

    const callbackTimingLabel = getCallbackTimingLabel(
      validatedCallPreference,
      callbackAt,
    );

    setIsSubmitting(true);
    setStatus({ type: "idle", message: "" });

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      controller.abort();
    }, contactFormTimeoutMs);

    try {
      const response = await fetch(contactFormEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          name,
          email,
          phone,
          website,
          service,
          callPreference: validatedCallPreference,
          callbackDate:
            validatedCallPreference === "scheduled" ? callbackDate : null,
          callbackTime:
            validatedCallPreference === "scheduled" ? callbackTime : null,
          callbackAt:
            validatedCallPreference === "scheduled" ? callbackAt : null,
          note: message,
          privacyConsent,
          privacyConsentText,
          privacyConsentAt: new Date().toISOString(),
          message: [
            service ? `Služba: ${service}` : null,
            `Preferovaný čas hovoru: ${callbackTimingLabel}`,
            privacyConsent ? `Souhlas: ${privacyConsentText}` : null,
            message ? `Poznámka: ${message}` : null,
          ]
            .filter(Boolean)
            .join("\n\n"),
        }),
      });

      const { data, hasInvalidJson } = await readContactFormResponse(response);

      if (!response.ok || data?.success === false) {
        throw new Error(getServerErrorMessage(response, data?.message));
      }

      if (hasInvalidJson) {
        throw new Error(
          "Zprávu se nepodařilo potvrdit, protože server vrátil nečitelnou odpověď. Zkuste to prosím znovu nebo nás kontaktujte přímo.",
        );
      }

      setStatus({
        type: "success",
        message: data?.message ?? "Zpráva byla úspěšně odeslána.",
      });
      currentForm.reset();
      setCallPreference(defaultCallPreference);
      setScheduledCallDate("");
      setScheduledCallTime("");
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
    <section
      id="contact"
      tabIndex={-1}
      className="bg-(--section-bg) px-5 py-16 focus:outline-none md:px-12 lg:px-16"
    >
      <div className="grid overflow-hidden rounded-3xl bg-white shadow-[0_25px_80px_rgba(6,26,52,0.1)] lg:grid-cols-[0.75fr_1.35fr_0.8fr]">
        <div className="bg-[#f4efe7] p-9">
          <h2 className="font-serif text-5xl leading-tight">{contact.title}</h2>
          <p className="mt-6 leading-7 text-[#061a34]/65">
            {contact.description}
          </p>

          <div className="mt-8 space-y-3 text-sm leading-6 text-[#061a34]/65">
            {contact.notes.map((note) => (
              <p key={note}>{note}</p>
            ))}
          </div>

          <div className="mt-8 h-px w-14 bg-[#c89750]" />
        </div>

        <form className="grid gap-4 p-9" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <input
                name="name"
                className={getInputClassName("name")}
                placeholder="Jméno (nepovinné)"
                onInput={() => clearFieldError("name")}
              />
              {formErrors.name ? (
                <p className="text-xs font-medium text-red-700">
                  {formErrors.name}
                </p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <input
                name="phone"
                type="tel"
                className={getInputClassName("phone")}
                placeholder="Telefon"
                onInput={() => clearFieldError("phone")}
              />
              {formErrors.phone ? (
                <p className="text-xs font-medium text-red-700">
                  {formErrors.phone}
                </p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <input
                name="email"
                type="email"
                className={getInputClassName("email")}
                placeholder="E-mail"
                onInput={() => clearFieldError("email")}
              />
              {formErrors.email ? (
                <p className="text-xs font-medium text-red-700">
                  {formErrors.email}
                </p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <select
                name="service"
                className={getInputClassName("service")}
                defaultValue=""
                onChange={() => clearFieldError("service")}
              >
                <option value="">Vyberte službu</option>
                {contact.services.map((service) => (
                  <option key={service}>{service}</option>
                ))}
              </select>

              {formErrors.service ? (
                <p className="text-xs font-medium text-red-700">
                  {formErrors.service}
                </p>
              ) : null}
            </div>
          </div>

          <fieldset className="grid gap-3">
            <legend className="text-sm font-semibold text-[#061a34]">
              Kdy vám můžeme zavolat?
            </legend>

            <div className="grid gap-3 md:grid-cols-2">
              <label
                className={
                  callPreference === "immediately"
                    ? "rounded-2xl border border-[#c89750] bg-[#f4efe7] p-4 shadow-[0_12px_28px_rgba(200,151,80,0.12)]"
                    : "rounded-2xl border border-[#061a34]/10 bg-white p-4 transition hover:border-[#c89750]/50"
                }
              >
                <input
                  type="radio"
                  name="callPreference"
                  value="immediately"
                  checked={callPreference === "immediately"}
                  onChange={() => {
                    setCallPreference("immediately");
                    clearFieldError("callbackDate");
                    clearFieldError("callbackTime");
                  }}
                  className="sr-only"
                />
                <span className="block text-sm font-semibold text-[#061a34]">
                  Okamžitě
                </span>
                <span className="mt-2 block text-sm leading-6 text-[#061a34]/60">
                  Jakmile budeme mít prostor, ozveme se zpět bez dalšího
                  plánování.
                </span>
              </label>

              <label
                className={
                  callPreference === "scheduled"
                    ? "rounded-2xl border border-[#c89750] bg-[#f4efe7] p-4 shadow-[0_12px_28px_rgba(200,151,80,0.12)]"
                    : "rounded-2xl border border-[#061a34]/10 bg-white p-4 transition hover:border-[#c89750]/50"
                }
              >
                <input
                  type="radio"
                  name="callPreference"
                  value="scheduled"
                  checked={callPreference === "scheduled"}
                  onChange={() => {
                    setCallPreference("scheduled");
                    clearFieldError("callbackDate");
                    clearFieldError("callbackTime");

                    if (!scheduledCallDate && !scheduledCallTime) {
                      const minimumDate = getMinimumScheduledCallDate();
                      setScheduledCallDate(formatDateValue(minimumDate));
                      setScheduledCallTime(formatTimeValue(minimumDate));
                    }
                  }}
                  className="sr-only"
                />
                <span className="block text-sm font-semibold text-[#061a34]">
                  Vybrat datum a čas
                </span>
                <span className="mt-2 block text-sm leading-6 text-[#061a34]/60">
                  Zvolíte si přesný termín, kdy vám má náš tým zavolat.
                </span>
              </label>
            </div>

            {callPreference === "scheduled" ? (
              <div className="grid gap-4 rounded-2xl border border-[#c89750]/25 bg-[#fbf8f3] p-4">
                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
                  <div className="grid gap-2">
                    <label
                      htmlFor="callbackDate"
                      className="text-sm font-medium text-[#061a34]"
                    >
                      Datum hovoru
                    </label>
                    <input
                      id="callbackDate"
                      name="callbackDate"
                      type="date"
                      lang="cs-CZ"
                      className={getInputClassName("callbackDate")}
                      value={scheduledCallDate}
                      onChange={(event) => {
                        const nextDate = event.target.value;
                        setScheduledCallDate(nextDate);
                        clearFieldError("callbackDate");

                        if (
                          scheduledCallTime &&
                          isScheduledTimeOptionDisabled(
                            nextDate,
                            scheduledCallTime,
                          )
                        ) {
                          setScheduledCallTime("");
                        }
                      }}
                      min={getMinimumScheduledDateValue()}
                    />

                    {formErrors.callbackDate ? (
                      <p className="text-xs font-medium text-red-700">
                        {formErrors.callbackDate}
                      </p>
                    ) : null}
                  </div>

                  <div className="grid gap-2">
                    <label
                      htmlFor="callbackTime"
                      className="text-sm font-medium text-[#061a34]"
                    >
                      Čas hovoru
                    </label>
                    <select
                      id="callbackTime"
                      name="callbackTime"
                      className={getInputClassName("callbackTime")}
                      value={scheduledCallTime}
                      onChange={(event) => {
                        setScheduledCallTime(event.target.value);
                        clearFieldError("callbackTime");
                      }}
                    >
                      <option value="">Vyberte čas</option>
                      {availableScheduledTimeOptions.map((timeOption) => (
                        <option
                          key={timeOption}
                          value={timeOption}
                          disabled={isScheduledTimeOptionDisabled(
                            scheduledCallDate,
                            timeOption,
                          )}
                        >
                          {timeOption}
                        </option>
                      ))}
                    </select>

                    {formErrors.callbackTime ? (
                      <p className="text-xs font-medium text-red-700">
                        {formErrors.callbackTime}
                      </p>
                    ) : null}
                  </div>
                </div>

                {scheduledCallDate && scheduledCallTime ? (
                  <p className="text-sm leading-6 text-[#061a34]/70">
                    Vybraný termín:{" "}
                    <span className="font-medium text-[#061a34]">
                      {getFormattedScheduledCallSummary(
                        scheduledCallDate,
                        scheduledCallTime,
                      )}
                    </span>
                  </p>
                ) : null}

                <p className="text-xs leading-5 text-[#061a34]/55">
                  Datum se zobrazuje v českém formátu a čas vybíráte ve
                  24hodinovém režimu. Nabízíme pouze pracovní hodiny 08:00 až
                  20:00. Tento údaj se odešle i do interního e-mailu.
                </p>
              </div>
            ) : null}
          </fieldset>

          <div className="grid gap-2">
            <textarea
              name="message"
              className="input min-h-36 resize-none"
              placeholder="Stručně napište, co potřebujete řešit"
            />
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
            <p className="max-w-md text-sm leading-6 text-[#061a34]/55">
              Po odeslání dorazí požadavek přímo na {site.email}. Přímý
              kontakt najdete vedle formuláře.
            </p>

            <button
              type="submit"
              disabled={isSubmitting}
              className="contact-submit-button relative inline-flex min-w-46 items-center justify-center gap-3 overflow-hidden rounded-full bg-[#061a34] px-7 py-4 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(6,26,52,0.18)] transition hover:bg-[#0b274b] disabled:cursor-not-allowed"
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
                    : "Odeslat požadavek"}
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
                      {contact.successTitle}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-green-900/75">
                      {contact.successText}
                    </p>
                  </div>
                </div>
              ) : (
                status.message
              )}
            </div>
          ) : null}
        </form>

        <div className="border-l border-[#061a34]/10 p-9">
          <h3 className="font-serif text-2xl">{contact.asideTitle}</h3>

          <div className="mt-7 space-y-5 text-sm text-[#061a34]/65">
            <ContactLine
              icon={<IconPhone size={18} />}
              text={site.phone}
              href={site.phoneHref}
            />
            <ContactLine
              icon={<IconMail size={18} />}
              text={site.email}
              href={site.emailHref}
            />
            {hasAddress ? (
              <ContactLine
                icon={<IconMapPin size={18} />}
                text={site.address.join(", ")}
              />
            ) : null}
          </div>

          <div className="mt-8 rounded-3xl bg-[#061a34] p-6 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#c89750]">
              {contact.calloutKicker}
            </p>
            <h4 className="mt-4 font-serif text-2xl leading-tight">
              {contact.calloutTitle}
            </h4>
            <p className="mt-3 text-sm leading-7 text-white/68">
              {contact.calloutText}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

type ContactLineProps = {
  icon: ReactNode;
  text: string;
  href?: string;
};

async function readContactFormResponse(response: Response) {
  const responseText = await response.text();

  if (responseText.trim() === "") {
    return {
      data: null,
      hasInvalidJson: response.ok,
    };
  }

  try {
    return {
      data: JSON.parse(responseText) as ContactFormResponse,
      hasInvalidJson: false,
    };
  } catch {
    return {
      data: null,
      hasInvalidJson: response.ok,
    };
  }
}

function getContactFormErrors(error: z.ZodError<ContactFormValues>) {
  return error.issues.reduce<ContactFormErrors>((errors, issue) => {
    const fieldName = issue.path[0];

    if (typeof fieldName !== "string") {
      return errors;
    }

    const typedFieldName = fieldName as keyof ContactFormValues;

    if (!errors[typedFieldName]) {
      errors[typedFieldName] = issue.message;
    }

    return errors;
  }, {});
}

function getServerErrorMessage(response: Response, serverMessage?: string) {
  const messageFromServer = getUsefulServerMessage(serverMessage);

  if (response.ok) {
    return (
      messageFromServer ??
      "Zprávu se nepodařilo odeslat, protože server nepotvrdil doručení e-mailu. Zkuste to prosím znovu nebo nás kontaktujte přímo."
    );
  }

  if (response.status === 400) {
    return (
      messageFromServer ??
      "Zprávu se nepodařilo odeslat, protože formulář obsahuje neplatné nebo neúplné údaje. Zkontrolujte prosím telefon a e-mail."
    );
  }

  if (response.status === 401 || response.status === 403) {
    return (
      messageFromServer ??
      "Zprávu se nepodařilo odeslat, protože server požadavek odmítl. Zkuste prosím obnovit stránku nebo nás kontaktujte přímo."
    );
  }

  if (response.status === 404) {
    return "Zprávu se nepodařilo odeslat, protože odesílací adresa formuláře nebyla na serveru nalezena.";
  }

  if (response.status === 405) {
    return "Zprávu se nepodařilo odeslat, protože server nepovoluje odeslání formuláře touto metodou.";
  }

  if (response.status === 408) {
    return "Zprávu se nepodařilo odeslat, protože server neodpověděl včas. Zkuste to prosím znovu.";
  }

  if (response.status === 413) {
    return "Zprávu se nepodařilo odeslat, protože je příliš dlouhá. Zkraťte prosím text zprávy a odešlete formulář znovu.";
  }

  if (response.status === 429) {
    return "Zprávu se nepodařilo odeslat, protože bylo odesláno příliš mnoho požadavků za krátkou dobu. Zkuste to prosím za chvíli.";
  }

  if (response.status >= 500) {
    return (
      messageFromServer ??
      `Zprávu se nepodařilo odeslat z důvodu chyby serveru. Zkuste to prosím později nebo nám napište přímo na ${site.email}.`
    );
  }

  return (
    messageFromServer ??
    `Zprávu se nepodařilo odeslat. Server odpověděl stavem ${response.status}. Zkuste to prosím znovu nebo nás kontaktujte přímo.`
  );
}

function getSubmitErrorMessage(error: unknown) {
  if (error instanceof DOMException && error.name === "AbortError") {
    return "Zprávu se nepodařilo odeslat, protože server neodpověděl včas. Zkontrolujte prosím připojení a zkuste to znovu.";
  }

  if (error instanceof TypeError) {
    return "Zprávu se nepodařilo odeslat, protože se nepodařilo spojit se serverem. Může jít o výpadek připojení, nedostupný server nebo blokované CORS nastavení.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Zprávu se nepodařilo odeslat z neznámého důvodu. Zkuste to prosím znovu nebo nás kontaktujte přímo.";
}

function getUsefulServerMessage(serverMessage?: string) {
  const trimmedMessage = serverMessage?.trim();

  if (!trimmedMessage) {
    return undefined;
  }

  const normalizedMessage = trimmedMessage.toLocaleLowerCase("cs-CZ");

  if (
    normalizedMessage === "zprávu se nepodařilo odeslat." ||
    normalizedMessage === "zprávu se nepodařilo odeslat"
  ) {
    return undefined;
  }

  return trimmedMessage;
}

function getCallPreference(value?: string): CallPreference {
  return value === "scheduled" ? "scheduled" : "immediately";
}

function getMinimumScheduledCallAtValue() {
  return combineScheduledCallDateTime(
    getMinimumScheduledDateValue(),
    formatTimeValue(getMinimumScheduledCallDate()),
  );
}

function isValidScheduledCallDateTime(value: string) {
  const parsedDate = parseLocalDateTime(value);

  if (!parsedDate) {
    return false;
  }

  const minimumDate = parseLocalDateTime(getMinimumScheduledCallAtValue());

  return (
    minimumDate !== null &&
    parsedDate >= minimumDate &&
    isWithinScheduledCallHours(parsedDate)
  );
}

function getMinimumScheduledCallDate() {
  const minimumDate = new Date();
  minimumDate.setMinutes(
    minimumDate.getMinutes() + scheduledCallLeadTimeMinutes,
    0,
    0,
  );

  const workingDayStart = getScheduledCallDayBoundary(
    minimumDate,
    scheduledCallStartHour,
  );
  const workingDayEnd = getScheduledCallDayBoundary(
    minimumDate,
    scheduledCallEndHour,
  );

  if (minimumDate < workingDayStart) {
    return workingDayStart;
  }

  if (minimumDate > workingDayEnd) {
    return getNextScheduledCallDayStart(minimumDate);
  }

  const remainder = minimumDate.getMinutes() % scheduledCallIntervalMinutes;
  if (remainder !== 0) {
    minimumDate.setMinutes(
      minimumDate.getMinutes() + (scheduledCallIntervalMinutes - remainder),
    );
  }

  if (minimumDate > workingDayEnd) {
    return getNextScheduledCallDayStart(minimumDate);
  }

  return minimumDate;
}

function getMinimumScheduledDateValue() {
  return formatDateValue(getMinimumScheduledCallDate());
}

function formatDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatTimeValue(date: Date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

function getAvailableScheduledTimeOptions() {
  const times: string[] = [];
  const startMinutes = scheduledCallStartHour * 60;
  const endMinutes = scheduledCallEndHour * 60;

  for (
    let totalMinutes = startMinutes;
    totalMinutes <= endMinutes;
    totalMinutes += scheduledCallIntervalMinutes
  ) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const timeValue = `${String(hours).padStart(2, "0")}:${String(
      minutes,
    ).padStart(2, "0")}`;
    times.push(timeValue);
  }

  return times;
}

function combineScheduledCallDateTime(date: string, time: string) {
  if (!date || !time) {
    return "";
  }

  return `${date}T${time}`;
}

function getFormattedScheduledCallSummary(date: string, time: string) {
  return getCallbackTimingLabel(
    "scheduled",
    combineScheduledCallDateTime(date, time),
  );
}

function getScheduledCallDayBoundary(date: Date, hour: number) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    hour,
    0,
    0,
    0,
  );
}

function getNextScheduledCallDayStart(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + 1,
    scheduledCallStartHour,
    0,
    0,
    0,
  );
}

function isWithinScheduledCallHours(date: Date) {
  const totalMinutes = date.getHours() * 60 + date.getMinutes();
  const startMinutes = scheduledCallStartHour * 60;
  const endMinutes = scheduledCallEndHour * 60;

  return totalMinutes >= startMinutes && totalMinutes <= endMinutes;
}

function isScheduledTimeOptionDisabled(selectedDate: string, timeValue: string) {
  if (!selectedDate) {
    return false;
  }

  const minimumDate = getMinimumScheduledCallDate();
  const minimumDateValue = formatDateValue(minimumDate);
  const minimumTimeValue = formatTimeValue(minimumDate);

  return selectedDate === minimumDateValue && timeValue < minimumTimeValue;
}

function getCallbackTimingLabel(
  callPreference: CallPreference,
  scheduledValue: string,
) {
  if (callPreference === "immediately") {
    return "Okamžitě";
  }

  const parsedDate = parseLocalDateTime(scheduledValue);

  if (!parsedDate) {
    return scheduledValue;
  }

  return new Intl.DateTimeFormat("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsedDate);
}

function parseLocalDateTime(value: string) {
  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/,
  );

  if (!match) {
    return null;
  }

  const [, year, month, day, hour, minute] = match;
  const parsedDate = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
  );

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  if (
    parsedDate.getFullYear() !== Number(year) ||
    parsedDate.getMonth() !== Number(month) - 1 ||
    parsedDate.getDate() !== Number(day) ||
    parsedDate.getHours() !== Number(hour) ||
    parsedDate.getMinutes() !== Number(minute)
  ) {
    return null;
  }

  return parsedDate;
}

function ContactLine({ icon, text, href }: ContactLineProps) {
  const content = (
    <>
      <span className="text-[#c89750]">{icon}</span>
      <span>{text}</span>
    </>
  );

  if (href) {
    return (
      <a href={href} className="flex gap-3 transition hover:text-[#061a34]">
        {content}
      </a>
    );
  }

  return <div className="flex gap-3">{content}</div>;
}
