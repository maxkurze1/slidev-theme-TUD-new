import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";

// `Do` (ordinal day, e.g. "23rd") lives in the advancedFormat plugin.
dayjs.extend(advancedFormat);

/* ================================ */
/*        export composables        */
/* ================================ */

export function formatString(template : string, values : any) {
  return template.replace(/{(\w+)}/g, (_, key) => values[key] ?? `{${key}}`);
}

// Expand `\today` and `\now` tokens in a string, each with an optional
// day.js format in square brackets (see https://day.js.org/docs/en/display/format):
//   \today               -> "June 23rd, 2026"        (the long, human format)
//   \today[YYYY-MM-DD]    -> "2026-06-23"
//   \now                 -> "2026-06-23 14:05:09"     (date + time, no format given)
//   \now[HH:mm]           -> "14:05"
// `\today` and `\now` only differ in their default (no-bracket) format; both
// accept any day.js format string.
export function expandDateTokens(template : string, now = new Date()) {
  const d = dayjs(now);
  return String(template).replace(
    /\\(today|now)(?:\[([^\]]*)\])?/g,
    (_, kind, fmt) => {
      if (fmt != null)
        return d.format(fmt);
      return kind === "today" ? d.format("MMMM Do, YYYY") : d.format("MMMM Do, YYYY HH:mm");
    },
  );
}
