import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';

const rules = [
  { key: 'length', label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
  { key: 'uppercase', label: 'One uppercase letter', test: (pw) => /[A-Z]/.test(pw) },
  { key: 'lowercase', label: 'One lowercase letter', test: (pw) => /[a-z]/.test(pw) },
  { key: 'number', label: 'One number', test: (pw) => /[0-9]/.test(pw) },
  { key: 'special', label: 'One special character', test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

/**
 * Returns true when every rule passes.
 */
export function isPasswordStrong(password) {
  return rules.every((r) => r.test(password));
}

/**
 * PasswordStrengthMeter — renders a segmented bar + checklist.
 *
 * @param {{ password: string }} props
 */
export default function PasswordStrengthMeter({ password }) {
  const results = useMemo(
    () => rules.map((r) => ({ ...r, passed: r.test(password) })),
    [password],
  );

  const passedCount = results.filter((r) => r.passed).length;
  const total = rules.length;
  const ratio = passedCount / total;

  // Strength label & colour mapping
  const strength = useMemo(() => {
    if (passedCount === 0) return { label: '', color: 'bg-dark-700', textColor: 'text-dark-400' };
    if (passedCount <= 2) return { label: 'Weak', color: 'bg-red-500', textColor: 'text-red-400' };
    if (passedCount <= 3) return { label: 'Fair', color: 'bg-amber-500', textColor: 'text-amber-400' };
    if (passedCount <= 4) return { label: 'Good', color: 'bg-primary-400', textColor: 'text-primary-400' };
    return { label: 'Strong', color: 'bg-accent-400', textColor: 'text-accent-400' };
  }, [passedCount]);

  if (!password) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25 }}
      className="mt-3 space-y-3"
    >
      {/* ── Segmented strength bar ─────────────────── */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex gap-1">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                i < passedCount ? strength.color : 'bg-dark-700'
              }`}
            />
          ))}
        </div>
        <AnimatePresence mode="wait">
          {strength.label && (
            <motion.span
              key={strength.label}
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              className={`text-xs font-semibold ${strength.textColor} min-w-[48px] text-right`}
            >
              {strength.label}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* ── Requirements checklist ─────────────────── */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
        {results.map((r) => (
          <li key={r.key} className="flex items-center gap-2 text-xs">
            <motion.div
              initial={false}
              animate={{
                scale: r.passed ? [1, 1.2, 1] : 1,
                color: r.passed ? '#3fb950' : '#484f58',
              }}
              transition={{ duration: 0.2 }}
            >
              {r.passed ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <X className="w-3.5 h-3.5" />
              )}
            </motion.div>
            <span className={`transition-colors duration-200 ${r.passed ? 'text-gray-300' : 'text-dark-400'}`}>
              {r.label}
            </span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
