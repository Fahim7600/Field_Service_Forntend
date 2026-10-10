"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Copy, ExternalLink, Mail, RotateCcw } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";
import {
  CONTACT_TOPICS,
  type ContactFormValues,
  contactFormSchema,
} from "@/lib/validations/contact";

interface ContactFormProps {
  recipientEmail: string;
}

export function ContactForm({ recipientEmail }: ContactFormProps) {
  const [submittedData, setSubmittedData] = useState<{
    subject: string;
    body: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      email: "",
      topic: "Booking question",
      message: "",
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = form;

  const watchedMessage = watch("message") || "";

  const onSubmit = (values: ContactFormValues) => {
    const safeName = values.name.replace(/[\r\n]+/g, " ").trim();
    const safeTopic = values.topic.replace(/[\r\n]+/g, " ").trim();
    const safeEmail = values.email.replace(/[\r\n]+/g, " ").trim();

    const subject = `[${safeTopic}] Message from ${safeName}`;
    const body = `${values.message}\n\n${safeName} (${safeEmail})`;

    const mailtoUrl = `mailto:${encodeURIComponent(recipientEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    if (mailtoUrl.length > 1800) {
      notify.warning(
        "Message is very long",
        "Your message exceeds standard email link limits. Please use the Copy button below to paste into your email.",
      );
    } else {
      window.location.href = mailtoUrl;
    }

    notify.info(
      "Opening your email app",
      "If nothing opens, copy the message and email us directly.",
    );

    setSubmittedData({ subject, body });
  };

  const handleCopyMessage = async () => {
    if (!submittedData) return;
    const fullText = `Subject: ${submittedData.subject}\n\n${submittedData.body}`;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(fullText);
        setCopied(true);
        notify.success("Copied", "The message was copied to your clipboard.");
        setTimeout(() => setCopied(false), 2500);
      } else {
        throw new Error("Clipboard unavailable");
      }
    } catch {
      // Safe fallback
      const textarea = document.createElement("textarea");
      textarea.value = fullText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      notify.success("Copied", "The message was copied to your clipboard.");
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleReset = () => {
    setSubmittedData(null);
    setCopied(false);
    reset();
  };

  if (submittedData) {
    return (
      <output
        aria-live="polite"
        className="block rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-6"
      >
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#0F172A]">
              Ready to Send in Your Email App
            </h3>
            <p className="text-xs sm:text-sm text-[#334155] mt-1 leading-relaxed">
              Your email app should open with your message ready to send.
              Nothing is sent until you press Send there.
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-muted/60 border border-border p-4 text-xs font-mono text-muted-foreground space-y-2 max-h-48 overflow-y-auto">
          <p className="font-semibold text-foreground">To: {recipientEmail}</p>
          <p className="font-semibold text-foreground">
            Subject: {submittedData.subject}
          </p>
          <hr className="border-border my-2" />
          <p className="whitespace-pre-wrap">{submittedData.body}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <Button
            type="button"
            variant="default"
            onClick={handleCopyMessage}
            className="w-full sm:w-auto font-semibold"
          >
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copied to clipboard
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy message
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="w-full sm:w-auto"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Write another message
          </Button>
        </div>
      </output>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-5"
    >
      <div>
        <h2 className="text-xl font-bold text-[#0F172A]">Send a Message</h2>
        <p className="text-xs sm:text-sm text-[#334155] mt-1">
          Compose your message below. Submitting opens your default email client
          with everything pre-filled.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contact-name">Your Name</Label>
        <Input
          id="contact-name"
          placeholder="Jane Doe"
          {...register("name")}
          aria-invalid={Boolean(errors.name)}
          className="h-10"
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contact-email">Your Email Address</Label>
        <Input
          id="contact-email"
          type="email"
          placeholder="jane@example.com"
          {...register("email")}
          aria-invalid={Boolean(errors.email)}
          className="h-10"
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contact-topic">Topic</Label>
        <select
          id="contact-topic"
          {...register("topic")}
          aria-invalid={Boolean(errors.topic)}
          className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
        >
          {CONTACT_TOPICS.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>
        {errors.topic && (
          <p className="text-xs text-destructive">{errors.topic.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="contact-message">Message</Label>
          <span
            className={cn(
              "text-xs",
              watchedMessage.length > 1000
                ? "text-destructive font-semibold"
                : "text-muted-foreground",
            )}
          >
            {watchedMessage.length} / 1000
          </span>
        </div>
        <Textarea
          id="contact-message"
          rows={5}
          placeholder="How can our operations team assist you with your booking, account, or property service?"
          {...register("message")}
          aria-invalid={Boolean(errors.message)}
          className="resize-none"
        />
        {errors.message && (
          <p className="text-xs text-destructive">{errors.message.message}</p>
        )}
      </div>

      <Button
        type="submit"
        variant="default"
        className="w-full h-11 text-sm font-semibold justify-center"
      >
        <ExternalLink className="mr-2 h-4 w-4" />
        Open Email Client
      </Button>

      <p className="text-[11px] text-[#475569] text-center">
        No message is sent automatically. Your email client handles delivery.
      </p>
    </form>
  );
}
