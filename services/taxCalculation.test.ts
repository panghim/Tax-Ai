import { describe, it, expect } from 'vitest';
import { calculateTaxSummary, calculatePayrollTax, calculateVATBurdenRate, calculateIncomeTaxBurdenRate, calculateNetProfit } from '../services/taxCalculation';
import { smallScaleInvoices, generalInvoices, emptyInvoices, employeeZhang, employeeLi, employeeHighIncome } from '../__fixtures__/tax.fixtures';
import { TaxpayerType } from '../types';

describe('calculateTaxSummary', () => {
  describe('small-scale taxpayer', () => {
    it('should sum income and expense correctly', () => {
      const result = calculateTaxSummary({
        invoices: smallScaleInvoices,
        taxpayerType: TaxpayerType.SMALL_SCALE
      });

      expect(result.totalIncome).toBe(10000);
      expect(result.totalExpense).toBe(5000);
    });

    it('should calculate output VAT from invoiced income only', () => {
      const result = calculateTaxSummary({
        invoices: smallScaleInvoices,
        taxpayerType: TaxpayerType.SMALL_SCALE
      });

      expect(result.totalOutputVAT).toBe(300);
    });

    it('should calculate input VAT from invoiced expense only', () => {
      const result = calculateTaxSummary({
        invoices: smallScaleInvoices,
        taxpayerType: TaxpayerType.SMALL_SCALE
      });

      expect(result.totalInputVAT).toBe(0);
    });

    it('should set payableVAT equal to outputVAT for small-scale', () => {
      const result = calculateTaxSummary({
        invoices: smallScaleInvoices,
        taxpayerType: TaxpayerType.SMALL_SCALE
      });

      expect(result.payableVAT).toBe(300);
    });

    it('should calculate surcharges as 12% of payableVAT', () => {
      const result = calculateTaxSummary({
        invoices: smallScaleInvoices,
        taxpayerType: TaxpayerType.SMALL_SCALE
      });

      expect(result.surcharges).toBeCloseTo(300 * 0.12, 2);
    });

    it('should calculate profit and income tax', () => {
      const result = calculateTaxSummary({
        invoices: smallScaleInvoices,
        taxpayerType: TaxpayerType.SMALL_SCALE
      });

      expect(result.estimatedIncomeTax).toBeCloseTo((10000 - 5000) * 0.25, 2);
    });
  });

  describe('general taxpayer', () => {
    it('should sum income and expense correctly', () => {
      const result = calculateTaxSummary({
        invoices: generalInvoices,
        taxpayerType: TaxpayerType.GENERAL
      });

      expect(result.totalIncome).toBe(130000);
      expect(result.totalExpense).toBe(60000);
    });

    it('should calculate output VAT from invoiced income only', () => {
      const result = calculateTaxSummary({
        invoices: generalInvoices,
        taxpayerType: TaxpayerType.GENERAL
      });

      expect(result.totalOutputVAT).toBe(13000);
    });

    it('should calculate input VAT from invoiced expense', () => {
      const result = calculateTaxSummary({
        invoices: generalInvoices,
        taxpayerType: TaxpayerType.GENERAL
      });

      expect(result.totalInputVAT).toBe(7800);
    });

    it('should deduct input VAT from output VAT for general taxpayer', () => {
      const result = calculateTaxSummary({
        invoices: generalInvoices,
        taxpayerType: TaxpayerType.GENERAL
      });

      expect(result.payableVAT).toBe(5200);
    });

    it('should not allow negative payableVAT', () => {
      const inputHeavyInvoice = {
        ...generalInvoices[1],
        taxAmount: 20000,
        totalAmount: 80000
      };

      const result = calculateTaxSummary({
        invoices: [generalInvoices[0], inputHeavyInvoice],
        taxpayerType: TaxpayerType.GENERAL
      });

      expect(result.payableVAT).toBe(0);
    });

    it('should calculate surcharges as 12% of payableVAT', () => {
      const result = calculateTaxSummary({
        invoices: generalInvoices,
        taxpayerType: TaxpayerType.GENERAL
      });

      expect(result.surcharges).toBeCloseTo(5200 * 0.12, 2);
    });
  });

  describe('empty invoices', () => {
    it('should return all zeros for empty input', () => {
      const result = calculateTaxSummary({
        invoices: emptyInvoices,
        taxpayerType: TaxpayerType.SMALL_SCALE
      });

      expect(result.totalIncome).toBe(0);
      expect(result.totalExpense).toBe(0);
      expect(result.totalInputVAT).toBe(0);
      expect(result.totalOutputVAT).toBe(0);
      expect(result.payableVAT).toBe(0);
      expect(result.estimatedIncomeTax).toBe(0);
      expect(result.surcharges).toBe(0);
    });
  });
});

describe('calculatePayrollTax', () => {
  it('should calculate taxable income for employee Zhang', () => {
    const result = calculatePayrollTax(employeeZhang);

    const expectedTaxable = 15000 - 5000 - 1575 - 1800 - 2000;
    expect(result.taxableIncome).toBe(expectedTaxable);
  });

  it('should calculate tax payable at 3% by default', () => {
    const result = calculatePayrollTax(employeeZhang);

    const expectedTaxable = 15000 - 5000 - 1575 - 1800 - 2000;
    expect(result.taxPayable).toBeCloseTo(expectedTaxable * 0.03, 2);
  });

  it('should calculate net salary', () => {
    const result = calculatePayrollTax(employeeZhang);

    const expectedTaxable = 15000 - 5000 - 1575 - 1800 - 2000;
    const expectedTax = expectedTaxable * 0.03;
    const expectedNet = 15000 - 1575 - 1800 - expectedTax;
    expect(result.netSalary).toBeCloseTo(expectedNet, 2);
  });

  it('should handle low-income employee (Li)', () => {
    const result = calculatePayrollTax(employeeLi);

    expect(result.taxableIncome).toBeGreaterThanOrEqual(0);
    expect(result.netSalary).toBeLessThanOrEqual(employeeLi.grossSalary);
  });

  it('should handle high-income employee', () => {
    const result = calculatePayrollTax(employeeHighIncome);

    expect(result.taxableIncome).toBeGreaterThan(0);
    expect(result.taxPayable).toBeGreaterThan(0);
  });

  it('should not produce negative taxable income', () => {
    const lowIncome = {
      grossSalary: 3000,
      socialSecurity: 315,
      housingFund: 360,
      specialDeductions: 1500
    };

    const result = calculatePayrollTax(lowIncome);

    expect(result.taxableIncome).toBe(0);
    expect(result.taxPayable).toBe(0);
  });
});

describe('calculateVATBurdenRate', () => {
  it('should calculate VAT burden rate correctly', () => {
    expect(calculateVATBurdenRate(300, 10000)).toBeCloseTo(0.03, 4);
  });

  it('should return 0 when income is 0', () => {
    expect(calculateVATBurdenRate(300, 0)).toBe(0);
  });
});

describe('calculateIncomeTaxBurdenRate', () => {
  it('should calculate income tax burden rate correctly', () => {
    expect(calculateIncomeTaxBurdenRate(1250, 10000)).toBeCloseTo(0.125, 4);
  });

  it('should return 0 when income is 0', () => {
    expect(calculateIncomeTaxBurdenRate(1250, 0)).toBe(0);
  });
});

describe('calculateNetProfit', () => {
  it('should calculate net profit correctly', () => {
    expect(calculateNetProfit(10000, 5000, 500)).toBe(4500);
  });

  it('should not return negative profit', () => {
    expect(calculateNetProfit(1000, 5000, 100)).toBe(0);
  });
});