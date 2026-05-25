export function formatCurrency(valueInCents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(valueInCents / 100);
}

export function buildInstallment(valueInCents: number) {
  const installmentValue = valueInCents / 10 / 100;

  return `10x ${new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(installmentValue)} sem juros`;
}