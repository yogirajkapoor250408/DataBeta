export interface ColumnProfile {
  headerName: string;
  detectedType: 'date' | 'number' | 'currency' | 'text' | 'category' | 'unknown';
  mappedSemantic: 'date' | 'revenue' | 'expense' | 'profit' | 'category' | 'product' | 'customer' | 'quantity' | 'unknown';
  confidenceScore: number; // 0 - 100%
  sampleValues: any[];
  nullCount: number;
  totalCount: number;
  cardinality: number;
}

export interface DatasetProfile {
  totalRows: number;
  totalColumns: number;
  columns: ColumnProfile[];
  overallQualityScore: number;
  detectedCurrency: string;
  dateRange: { start: Date | null; end: Date | null };
}

/**
 * Intelligent Data Profiler calculating confidence scores and value distribution characteristics.
 */
export function profileDataset(headers: string[], rawRows: Record<string, any>[]): DatasetProfile {
  const totalRows = rawRows.length;
  const totalColumns = headers.length;

  let minDate: Date | null = null;
  let maxDate: Date | null = null;

  const columnProfiles: ColumnProfile[] = headers.map((header) => {
    const lowerHeader = header.toLowerCase().trim();
    const samples: any[] = [];
    let nullCount = 0;
    const valueSet = new Set<string>();

    let dateMatches = 0;
    let numberMatches = 0;

    rawRows.forEach((row) => {
      const val = row[header];
      if (val === undefined || val === null || val === '') {
        nullCount++;
      } else {
        const strVal = String(val).trim();
        valueSet.add(strVal);
        if (samples.length < 5) samples.push(val);

        // Check if date
        const parsedDate = new Date(strVal);
        if (!isNaN(parsedDate.getTime()) && strVal.length >= 6) {
          dateMatches++;
          if (!minDate || parsedDate < minDate) minDate = parsedDate;
          if (!maxDate || parsedDate > maxDate) maxDate = parsedDate;
        }

        // Check if number/currency
        const cleanNum = Number(strVal.replace(/[^0-9.-]+/g, ''));
        if (!isNaN(cleanNum)) {
          numberMatches++;
        }
      }
    });

    const validCount = totalRows - nullCount;
    let detectedType: ColumnProfile['detectedType'] = 'unknown';
    if (validCount > 0) {
      if (dateMatches / validCount > 0.6) detectedType = 'date';
      else if (numberMatches / validCount > 0.7) detectedType = 'currency';
      else if (valueSet.size < Math.min(20, validCount * 0.3)) detectedType = 'category';
      else detectedType = 'text';
    }

    // Determine semantic & confidence
    let mappedSemantic: ColumnProfile['mappedSemantic'] = 'unknown';
    let confidenceScore = 50;

    if (lowerHeader.includes('date') || lowerHeader.includes('time') || lowerHeader.includes('day')) {
      mappedSemantic = 'date';
      confidenceScore = detectedType === 'date' ? 100 : 75;
    } else if (lowerHeader.includes('rev') || lowerHeader.includes('sales') || lowerHeader.includes('credit') || lowerHeader.includes('amount')) {
      mappedSemantic = 'revenue';
      confidenceScore = detectedType === 'currency' ? 96 : 78;
    } else if (lowerHeader.includes('exp') || lowerHeader.includes('cost') || lowerHeader.includes('debit') || lowerHeader.includes('fee')) {
      mappedSemantic = 'expense';
      confidenceScore = detectedType === 'currency' ? 95 : 75;
    } else if (lowerHeader.includes('cust') || lowerHeader.includes('client') || lowerHeader.includes('buyer') || lowerHeader.includes('user')) {
      mappedSemantic = 'customer';
      confidenceScore = 91;
    } else if (lowerHeader.includes('prod') || lowerHeader.includes('item') || lowerHeader.includes('sku') || lowerHeader.includes('title')) {
      mappedSemantic = 'product';
      confidenceScore = 92;
    } else if (lowerHeader.includes('cat') || lowerHeader.includes('type') || lowerHeader.includes('group')) {
      mappedSemantic = 'category';
      confidenceScore = 88;
    }

    return {
      headerName: header,
      detectedType,
      mappedSemantic,
      confidenceScore,
      sampleValues: samples,
      nullCount,
      totalCount: totalRows,
      cardinality: valueSet.size,
    };
  });

  const avgConfidence = columnProfiles.reduce((acc, c) => acc + c.confidenceScore, 0) / (totalColumns || 1);

  return {
    totalRows,
    totalColumns,
    columns: columnProfiles,
    overallQualityScore: Math.round(avgConfidence),
    detectedCurrency: 'USD',
    dateRange: { start: minDate, end: maxDate },
  };
}
