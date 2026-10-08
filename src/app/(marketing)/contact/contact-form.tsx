"use client";

import { Send } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ContactForm() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in all fields before submitting.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      toast.success("Message sent!", {
        description:
          "We have received your message and will reply within 24 hours.",
      });
      setName("");
      setEmail("");
      setMessage("");
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4"
    >
      <div className="space-y-1.5">
        <Label htmlFor="contact-name" className="text-charcoal-900 font-medium">
          Name
        </Label>
        <Input
          id="contact-name"
          type="text"
          placeholder="Your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="h-10"
        />
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="contact-email"
          className="text-charcoal-900 font-medium"
        >
          Email
        </Label>
        <Input
          id="contact-email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-10"
        />
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="contact-message"
          className="text-charcoal-900 font-medium"
        >
          Message
        </Label>
        <Textarea
          id="contact-message"
          placeholder="How can our service team assist you?"
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          className="resize-none"
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-11 text-base font-semibold bg-charcoal-900 hover:bg-charcoal-800 text-white"
      >
        {isSubmitting ? (
          "Sending..."
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Send Message
          </>
        )}
      </Button>
    </form>
  );
}
