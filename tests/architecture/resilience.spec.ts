/**
 * Teste de arquitetura: entries-service não depende de consolidated-service
 */
import * as fs from 'fs';
import * as path from 'path';

describe('Architecture resilience contracts', () => {
  it('entries-service should not import consolidated-service', () => {
    const entriesSrc = path.join(__dirname, '../../apps/entries-service/src');
    const files = getAllTsFiles(entriesSrc);
    const violations: string[] = [];

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      if (
        content.includes('consolidated-service') ||
        content.includes('daily-balance') ||
        content.includes('reporting.daily_balances')
      ) {
        violations.push(file);
      }
    }

    expect(violations).toEqual([]);
  });

  it('entries create flow uses outbox pattern (not sync call to reporting)', () => {
    const servicePath = path.join(
      __dirname,
      '../../apps/entries-service/src/entries/entries.service.ts',
    );
    const content = fs.readFileSync(servicePath, 'utf-8');
    expect(content).toContain('saveOutboxEvent');
    expect(content).not.toContain('consolidated');
  });
});

function getAllTsFiles(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...getAllTsFiles(full));
    } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.spec.ts')) {
      results.push(full);
    }
  }
  return results;
}
