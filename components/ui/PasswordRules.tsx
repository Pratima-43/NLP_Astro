import { Check, Circle } from "lucide-react";

export function passwordProblems(password: string): string[] {
  const problems: string[] = [];
  if (password.length < 8) problems.push("length");
  if (!/[a-z]/i.test(password) || !/\d/.test(password)) problems.push("mix");
  return problems;
}

/** Live checklist under a new-password box, matching the server's rules. */
export function PasswordRules({ password }: { password: string }) {
  const problems = passwordProblems(password);
  const rules = [
    { key: "length", text: "At least 8 characters" },
    { key: "mix", text: "Has letters and numbers" },
  ];
  return (
    <ul className="-mt-2 flex flex-col gap-1.5" aria-label="Password rules">
      {rules.map((rule) => {
        const met = password.length > 0 && !problems.includes(rule.key);
        return (
          <li key={rule.key} className={`flex items-center gap-2 text-base ${met ? "font-semibold text-good" : "text-ink-2"}`}>
            {met ? <Check className="h-5 w-5" aria-hidden="true" /> : <Circle className="h-5 w-5" aria-hidden="true" />}
            {rule.text}
            <span className="sr-only">{met ? "(done)" : "(not yet)"}</span>
          </li>
        );
      })}
    </ul>
  );
}
