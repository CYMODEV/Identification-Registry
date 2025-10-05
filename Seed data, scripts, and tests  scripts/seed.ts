import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  await prisma.consentPolicy.createMany({
    data: [
      { code: 'pol_personal_data_v1', name: 'Personal Data v1', description: 'Personal data handling', scope: { privacy: 'personal' } },
      { code: 'pol_operational_data_v1', name: 'Operational Data v1', description: 'Ops telemetry', scope: { privacy: 'minimal' } },
    ]
  });

  const agent = await prisma.agent.create({ data: { name: 'Cymos Attestor', glyph: '⚶', caption: 'We vouch with witnesses', storyAnchor: 'Covenant of Names' } });

  const cap = await prisma.capability.create({
    data: {
      capabilityId: 'cap_4fd82a1b',
      name: 'Identity Attestor Vouch',
      kind: 'function',
      version: '1.2.0',
      ownerId: agent.id,
      ownerType: 'agent',
      interface: { protocol: 'http', endpoint: '/attest', auth: 'signed_token' },
      inputs: [{ name: 'claim', type: 'string' }],
      outputs: [{ name: 'attestation_score', type: 'number' }],
      tags: ['identity', 'governance'],
      dependsOn: [],
      risk: { level: 'moderate', axes: { privacy: 'personal' } },
      auditIntervalDays: 30,
      steward: 'Cymos Identity Council',
      badges: ['Trustworks-Verified'],
      state: 'approved',
      identitySymbol: '⚶',
      identityCaption: 'We vouch with witnesses and light.',
      storyAnchor: 'Covenant of Names',
      useRights: 'community',
      attribution: 'Cymos Planet Stewardship'
    }
  });

  const pol = await prisma.consentPolicy.findUnique({ where: { code: 'pol_personal_data_v1' } });
  if (pol) {
    await prisma.capabilityConsent.create({ data: { capabilityId: cap.id, consentId: pol.id } });
  }

  await prisma.citizen.create({
    data: {
      kind: 'human',
      legalName: 'Dani Example',
      symbolicName: 'Breath-keeper',
      glyph: '✦',
      caption: 'Breath-bearer, keeper of covenant.',
      storyAnchor: 'Stewards of Breath',
    }
  });

  console.log('Seed complete');
}
run().finally(() => prisma.$disconnect());
import request from 'supertest';
import { createServer } from '../src/server';

describe('Citizens API', () => {
  const app = createServer();

  it('lists citizens', async () => {
    const res = await request(app).get('/citizens');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
