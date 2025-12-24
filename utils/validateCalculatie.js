export function validateCalculatie(calculatie) {
if (!calculatie.fases || calculatie.fases.length === 0) {
throw new Error("NO_PHASES_DEFINED")
}
if (calculatie.total <= 0) {
throw new Error("TOTAL_INVALID")
}
return true
}
