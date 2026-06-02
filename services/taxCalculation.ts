import { Invoice, InvoiceCategory, RecordStatus, TaxSummary, TaxpayerType, Employee } from '../types';

export interface TaxCalculationInput {
  invoices: Invoice[];
  taxpayerType: TaxpayerType;
}

export function calculateTaxSummary(input: TaxCalculationInput): TaxSummary {
  let totalIncome = 0;
  let totalExpense = 0;
  let totalInputVAT = 0;
  let totalOutputVAT = 0;

  input.invoices.forEach(inv => {
    if (inv.category === InvoiceCategory.INCOME) {
      totalIncome += inv.amount;
      if (inv.status === RecordStatus.INVOICED) {
        totalOutputVAT += inv.taxAmount;
      }
    } else {
      totalExpense += inv.amount;
      if (inv.status === RecordStatus.INVOICED) {
        totalInputVAT += inv.taxAmount;
      }
    }
  });

  let payableVAT = 0;

  if (input.taxpayerType === TaxpayerType.GENERAL) {
    payableVAT = Math.max(0, totalOutputVAT - totalInputVAT);
  } else {
    payableVAT = totalOutputVAT;
  }

  const profit = Math.max(0, totalIncome - totalExpense);
  const estimatedIncomeTax = profit * 0.25;

  return {
    totalIncome,
    totalExpense,
    totalInputVAT,
    totalOutputVAT,
    payableVAT,
    estimatedIncomeTax,
    surcharges: payableVAT * 0.12
  };
}

export function calculatePayrollTax(
  employee: Pick<Employee, 'grossSalary' | 'socialSecurity' | 'housingFund' | 'specialDeductions'>,
  taxRate: number = 0.03
): { taxableIncome: number; taxPayable: number; netSalary: number } {
  const basicDeduction = 5000;
  const taxableIncome = Math.max(
    0,
    employee.grossSalary - basicDeduction - employee.socialSecurity - employee.housingFund - employee.specialDeductions
  );
  const taxPayable = taxableIncome * taxRate;
  const netSalary = employee.grossSalary - employee.socialSecurity - employee.housingFund - taxPayable;

  return { taxableIncome, taxPayable, netSalary };
}

export function calculateVATBurdenRate(payableVAT: number, totalIncome: number): number {
  if (totalIncome <= 0) return 0;
  return payableVAT / totalIncome;
}

export function calculateIncomeTaxBurdenRate(estimatedIncomeTax: number, totalIncome: number): number {
  if (totalIncome <= 0) return 0;
  return estimatedIncomeTax / totalIncome;
}

export function calculateNetProfit(totalIncome: number, totalExpense: number, totalTax: number): number {
  return Math.max(0, totalIncome - totalExpense - totalTax);
}