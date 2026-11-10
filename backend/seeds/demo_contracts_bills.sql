-- Demo tenant profile for the development "tenant" login, so the tenant portal has data.
INSERT INTO tenants (user_id, name, phone, email, property_id, status, city, monthly_rent, outstanding_balance, balance_note, created_at, updated_at)
SELECT u.id, 'Demo Tenant', '+60 12-000 0000', 'tenant@example.com',
       (SELECT id FROM properties ORDER BY id LIMIT 1), 'active', 'Kuala Lumpur, MY', 1800, 0, '',
       CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM auth_users u
WHERE u.username = 'tenant' AND u.role = 'tenant'
  AND NOT EXISTS (SELECT 1 FROM tenants t WHERE t.user_id = u.id);

-- The "tenant" login gets its lease here, so the LIMIT below cannot skip it. Unit is backfilled further down.
INSERT INTO contracts (tenant_id, property_id, unit_id, start_date, end_date, monthly_rent, security_deposit, billing_day, status, notes, created_at, updated_at)
SELECT t.id, t.property_id, NULL,
       to_char(date_trunc('month', CURRENT_DATE) - INTERVAL '6 months', 'YYYY-MM-DD'),
       to_char(date_trunc('month', CURRENT_DATE) + INTERVAL '12 months', 'YYYY-MM-DD'),
       t.monthly_rent, t.monthly_rent * 2, 1 + (t.id % 28), 'active',
       'Demo lease data', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM tenants t JOIN auth_users u ON u.id = t.user_id
WHERE u.username = 'tenant' AND u.role = 'tenant'
  AND NOT EXISTS (SELECT 1 FROM contracts c WHERE c.tenant_id = t.id);

-- Demo lease records: only populate tenants that do not already have a contract.
INSERT INTO contracts (tenant_id, property_id, unit_id, start_date, end_date, monthly_rent, security_deposit, billing_day, status, notes, created_at, updated_at)
SELECT t.id, t.property_id, t.unit_id,
       to_char(date_trunc('month', CURRENT_DATE) - INTERVAL '6 months', 'YYYY-MM-DD'),
       to_char(date_trunc('month', CURRENT_DATE) + INTERVAL '12 months', 'YYYY-MM-DD'),
       t.monthly_rent, t.monthly_rent * 2, 1 + (t.id % 28), 'active',
       'Demo lease data', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM tenants t
WHERE t.monthly_rent IS NOT NULL AND t.status <> 'former'
  AND NOT EXISTS (SELECT 1 FROM contracts c WHERE c.tenant_id = t.id)
ORDER BY t.id
LIMIT 18;

-- A few draft leases make the contract status filter useful in a fresh demo database.
INSERT INTO contracts (tenant_id, property_id, unit_id, start_date, end_date, monthly_rent, security_deposit, billing_day, status, notes, created_at, updated_at)
SELECT t.id, t.property_id, t.unit_id,
       to_char(date_trunc('month', CURRENT_DATE), 'YYYY-MM-DD'), to_char(date_trunc('month', CURRENT_DATE) + INTERVAL '12 months', 'YYYY-MM-DD'),
       t.monthly_rent, t.monthly_rent * 2, 1 + (t.id % 28), 'draft',
       'Demo draft lease', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM tenants t
WHERE t.monthly_rent IS NOT NULL AND t.status <> 'former'
  AND NOT EXISTS (SELECT 1 FROM contracts c WHERE c.tenant_id = t.id)
ORDER BY t.id
LIMIT 3;

-- Four months of demo bills per active lease, with a mix of paid, partial and overdue states.
WITH RECURSIVE months(n) AS (
 SELECT 0 UNION ALL SELECT n + 1 FROM months WHERE n < 3
),
month_starts AS (
 SELECT n, (date_trunc('month', CURRENT_DATE) - INTERVAL '1 month' * n)::date AS first_day FROM months
)
INSERT INTO bills
 (contract_id, tenant_id, billing_period, due_date, amount, late_fee, amount_paid, status, issued_at, paid_at, payment_method, payment_reference, notes, created_at, updated_at)
SELECT c.id, c.tenant_id,
       to_char(ms.first_day, 'YYYY-MM'),
       to_char(ms.first_day + (c.billing_day - 1), 'YYYY-MM-DD'),
       c.monthly_rent, 0,
       CASE
         WHEN ms.n >= 2 THEN c.monthly_rent
         WHEN ms.n = 1 AND c.id % 4 <> 0 THEN c.monthly_rent
         WHEN ms.n = 0 AND c.id % 5 = 0 THEN CAST(ROUND(CAST(c.monthly_rent / 2.0 AS numeric), 2) AS double precision)
         ELSE 0
       END,
       CASE
         WHEN ms.n >= 2 THEN 'paid'
         WHEN ms.n = 1 AND c.id % 4 <> 0 THEN 'paid'
         WHEN ms.n = 0 AND c.id % 5 = 0 THEN 'partial'
         WHEN ms.first_day + (c.billing_day - 1) < CURRENT_DATE THEN 'overdue'
         ELSE 'unpaid'
       END,
       to_char(ms.first_day, 'YYYY-MM-DD'),
       CASE WHEN ms.n >= 2 OR (ms.n = 1 AND c.id % 4 <> 0) THEN to_char(ms.first_day + (c.billing_day - 1), 'YYYY-MM-DD') ELSE NULL END,
       CASE WHEN ms.n >= 2 OR (ms.n = 1 AND c.id % 4 <> 0) THEN 'bank_transfer' ELSE NULL END,
       CASE WHEN ms.n >= 2 OR (ms.n = 1 AND c.id % 4 <> 0) THEN 'DEMO-' || c.id || '-' || to_char(ms.first_day, 'YYYYMM') ELSE NULL END,
       'Demo bill data', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM contracts c CROSS JOIN month_starts ms
WHERE c.status = 'active'
ON CONFLICT DO NOTHING;

-- Payment records for demo bills that already carry a paid amount (idempotent; runs on every development start).
INSERT INTO payments (bill_id, tenant_id, amount, method, reference, paid_at, created_at)
SELECT b.id, b.tenant_id, b.amount_paid, COALESCE(b.payment_method, ''), COALESCE(b.payment_reference, ''),
       COALESCE(b.paid_at, b.issued_at, to_char(CURRENT_DATE, 'YYYY-MM-DD')), CURRENT_TIMESTAMP
FROM bills b
WHERE b.amount_paid > 0
  AND NOT EXISTS (SELECT 1 FROM payments p WHERE p.bill_id = b.id);

-- Long-term history for the "tenant" login: a unit, a lease that started about two years ago,
-- and a track record of paid rent, proofs, maintenance and complaints. Every statement is idempotent.
UPDATE tenants SET unit_id = (
    SELECT u.id FROM units u JOIN blocks bl ON bl.id = u.block_id
    WHERE bl.property_id = tenants.property_id
      AND u.id NOT IN (SELECT unit_id FROM tenants WHERE unit_id IS NOT NULL)
    ORDER BY u.id LIMIT 1)
WHERE unit_id IS NULL AND property_id IS NOT NULL
  AND id IN (SELECT t.id FROM tenants t JOIN auth_users u ON u.id = t.user_id WHERE u.username = 'tenant' AND u.role = 'tenant');

UPDATE units SET status = 'occupied'
WHERE status <> 'occupied'
  AND id IN (SELECT t.unit_id FROM tenants t JOIN auth_users u ON u.id = t.user_id WHERE u.username = 'tenant' AND t.unit_id IS NOT NULL);

UPDATE contracts SET unit_id = (SELECT t.unit_id FROM tenants t WHERE t.id = contracts.tenant_id), updated_at = CURRENT_TIMESTAMP
WHERE notes = 'Demo lease data' AND unit_id IS NULL
  AND tenant_id IN (SELECT t.id FROM tenants t JOIN auth_users u ON u.id = t.user_id WHERE u.username = 'tenant' AND u.role = 'tenant');

UPDATE contracts SET start_date = to_char(date_trunc('month', CURRENT_DATE) - INTERVAL '23 months', 'YYYY-MM-DD'), updated_at = CURRENT_TIMESTAMP
WHERE notes = 'Demo lease data' AND start_date > to_char(date_trunc('month', CURRENT_DATE) - INTERVAL '23 months', 'YYYY-MM-DD')
  AND tenant_id IN (SELECT t.id FROM tenants t JOIN auth_users u ON u.id = t.user_id WHERE u.username = 'tenant' AND u.role = 'tenant');

-- Paid rent for months 4 to 23 before the current month. About one in seven is paid late with a 50 late fee.
WITH RECURSIVE history(off) AS (
 SELECT 4 UNION ALL SELECT off + 1 FROM history WHERE off < 23
),
periods AS (
 SELECT c.id AS contract_id, c.tenant_id AS tenant_id, c.monthly_rent AS rent, h.off AS off,
        to_char(date_trunc('month', CURRENT_DATE) - INTERVAL '1 month' * h.off, 'YYYY-MM-DD') AS issued,
        to_char((date_trunc('month', CURRENT_DATE) - INTERVAL '1 month' * h.off)::date + (c.billing_day - 1), 'YYYY-MM-DD') AS due
 FROM contracts c CROSS JOIN history h
 WHERE c.notes = 'Demo lease data'
   AND c.tenant_id IN (SELECT t.id FROM tenants t JOIN auth_users u ON u.id = t.user_id WHERE u.username = 'tenant' AND u.role = 'tenant')
   AND to_char(date_trunc('month', CURRENT_DATE) - INTERVAL '1 month' * h.off, 'YYYY-MM-DD') >= c.start_date
)
INSERT INTO bills
 (contract_id, tenant_id, billing_period, due_date, amount, late_fee, amount_paid, status, issued_at, paid_at, payment_method, payment_reference, notes, created_at, updated_at)
SELECT contract_id, tenant_id, to_char(CAST(issued AS date), 'YYYY-MM'), due, rent,
       late, rent + late, 'paid', issued, paid, 'bank_transfer',
       'HIST-' || contract_id || '-' || to_char(CAST(issued AS date), 'YYYYMM'), 'Demo history data', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (
  SELECT p.*,
         CASE WHEN p.off % 7 = 3 THEN 50 ELSE 0 END AS late,
         CASE WHEN p.off % 7 = 3 THEN to_char(CAST(p.due AS date) + 9, 'YYYY-MM-DD') ELSE to_char(CAST(p.due AS date) - 2, 'YYYY-MM-DD') END AS paid
  FROM periods p
)
ON CONFLICT DO NOTHING;

INSERT INTO payments (bill_id, tenant_id, amount, method, reference, paid_at, created_at)
SELECT b.id, b.tenant_id, b.amount_paid, b.payment_method, b.payment_reference, b.paid_at, CURRENT_TIMESTAMP
FROM bills b
WHERE b.notes = 'Demo history data'
  AND b.tenant_id IN (SELECT t.id FROM tenants t JOIN auth_users u ON u.id = t.user_id WHERE u.username = 'tenant' AND u.role = 'tenant')
  AND NOT EXISTS (SELECT 1 FROM payments p WHERE p.bill_id = b.id);

-- Every third historical bill was paid through a proof that the admin approved.
INSERT INTO payment_proofs (bill_id, tenant_id, amount, paid_at, reference, file_key, file_url, status, reject_reason, reviewed_by, reviewed_at, created_at, updated_at)
SELECT b.id, b.tenant_id, b.amount_paid, b.paid_at, b.payment_reference, '', '', 'approved', '', 'admin', CAST(b.paid_at AS timestamp), CAST(b.paid_at AS timestamp), CAST(b.paid_at AS timestamp)
FROM bills b
WHERE b.notes = 'Demo history data' AND b.id % 3 = 0
  AND b.tenant_id IN (SELECT t.id FROM tenants t JOIN auth_users u ON u.id = t.user_id WHERE u.username = 'tenant' AND u.role = 'tenant')
  AND NOT EXISTS (SELECT 1 FROM payment_proofs pp WHERE pp.bill_id = b.id);

UPDATE payments SET proof_id = (
    SELECT pp.id FROM payment_proofs pp WHERE pp.bill_id = payments.bill_id AND pp.status = 'approved' ORDER BY pp.id LIMIT 1)
WHERE proof_id IS NULL
  AND tenant_id IN (SELECT t.id FROM tenants t JOIN auth_users u ON u.id = t.user_id WHERE u.username = 'tenant' AND u.role = 'tenant')
  AND bill_id IN (SELECT bill_id FROM payment_proofs WHERE status = 'approved' AND reviewed_by = 'admin');

-- The current-month bill has one rejected proof, so the tenant sees a reason on the proof list.
INSERT INTO payment_proofs (bill_id, tenant_id, amount, paid_at, reference, file_key, file_url, status, reject_reason, reviewed_by, reviewed_at, created_at, updated_at)
SELECT b.id, b.tenant_id, c.monthly_rent, to_char(CURRENT_DATE - 3, 'YYYY-MM-DD'), 'TRX-7731', '', '', 'rejected',
       'Amount on the transfer does not match the bill', 'admin', CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM bills b JOIN contracts c ON c.id = b.contract_id
WHERE c.notes = 'Demo lease data' AND b.notes = 'Demo bill data'
  AND b.billing_period = to_char(CURRENT_DATE, 'YYYY-MM') AND b.status <> 'paid'
  AND b.tenant_id IN (SELECT t.id FROM tenants t JOIN auth_users u ON u.id = t.user_id WHERE u.username = 'tenant' AND u.role = 'tenant')
  AND NOT EXISTS (SELECT 1 FROM payment_proofs pp WHERE pp.bill_id = b.id AND pp.reference = 'TRX-7731');

WITH m(category, priority, title, description, status, assignee, resolution_notes, created_at, resolved_at) AS (VALUES
 ('plumbing', 'normal', 'Kitchen tap dripping', 'Cold water tap drips constantly.', 'resolved', 'Maintenance team', 'Washer replaced.', CURRENT_TIMESTAMP - INTERVAL '20 months' + INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '20 months' + INTERVAL '5 days'),
 ('aircond', 'high', 'Air-conditioning not cooling', 'Living room unit runs but blows warm air.', 'resolved', 'Maintenance team', 'Gas top-up and filter cleaned.', CURRENT_TIMESTAMP - INTERVAL '16 months' + INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '16 months' + INTERVAL '3 days'),
 ('electrical', 'urgent', 'Bedroom switch sparking', 'Light switch crackled when turned on.', 'resolved', 'Maintenance team', 'Faulty switch replaced.', CURRENT_TIMESTAMP - INTERVAL '13 months' + INTERVAL '4 days', CURRENT_TIMESTAMP - INTERVAL '13 months' + INTERVAL '4 days' + INTERVAL '6 hours'),
 ('structure', 'low', 'Hallway ceiling crack', 'Hairline crack above the hallway light.', 'resolved', 'Maintenance team', 'Plaster repaired and repainted.', CURRENT_TIMESTAMP - INTERVAL '9 months' + INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '8 months'),
 ('appliance', 'normal', 'Washing machine not draining', 'Water stays in the drum after each cycle.', 'closed', 'Maintenance team', 'Drain hose cleared.', CURRENT_TIMESTAMP - INTERVAL '7 months' + INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '6 months'),
 ('plumbing', 'normal', 'Shower head leaking', 'Leak at the shower arm joint.', 'resolved', 'Maintenance team', 'Joint tightened and sealed.', CURRENT_TIMESTAMP - INTERVAL '4 months' + INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '4 months' + INTERVAL '4 days'),
 ('appliance', 'high', 'Water heater not turning on', 'No hot water since this morning.', 'resolved', 'Maintenance team', 'Thermostat replaced.', CURRENT_TIMESTAMP - INTERVAL '2 months' + INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '2 months' + INTERVAL '2 days'),
 ('structure', 'low', 'Balcony door lock stiff', 'Key turns with difficulty.', 'in_progress', 'Maintenance team', '', CURRENT_TIMESTAMP - INTERVAL '10 days', NULL),
 ('electrical', 'normal', 'Desk socket not working', 'Socket next to the desk has no power.', 'open', '', '', CURRENT_TIMESTAMP - INTERVAL '2 days', NULL)
)
INSERT INTO maintenance_requests (property_id, unit_id, tenant_id, category, priority, title, description, status, assignee, resolution_notes, resolved_at, created_at, updated_at)
SELECT t.property_id, t.unit_id, t.id, m.category, m.priority, m.title, m.description, m.status, m.assignee, m.resolution_notes, m.resolved_at, m.created_at, m.created_at
FROM tenants t JOIN auth_users u ON u.id = t.user_id CROSS JOIN m
WHERE u.username = 'tenant' AND u.role = 'tenant' AND t.unit_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM maintenance_requests r WHERE r.tenant_id = t.id AND r.title = m.title);

WITH k(category, title, description, status, assignee, resolution_notes, created_at, resolved_at) AS (VALUES
 ('noise', 'Late-night construction noise', 'Renovation work continued past 11pm on weekdays.', 'resolved', 'Management office', 'Contractor agreed to stop work after 9pm.', CURRENT_TIMESTAMP - INTERVAL '11 months', CURRENT_TIMESTAMP - INTERVAL '10 months'),
 ('hygiene', 'Rubbish left in corridor', 'Bags left outside a unit near the lift lobby for days.', 'closed', 'Management office', 'Reminder sent to all units; issue cleared.', CURRENT_TIMESTAMP - INTERVAL '5 months', CURRENT_TIMESTAMP - INTERVAL '4 months'),
 ('safety', 'Gate does not latch', 'The side gate closes but does not lock.', 'open', '', '', CURRENT_TIMESTAMP - INTERVAL '2 days', NULL)
)
INSERT INTO complaints (tenant_id, property_id, unit_id, category, title, description, status, assignee, resolution_notes, resolved_at, created_at, updated_at)
SELECT t.id, t.property_id, t.unit_id, k.category, k.title, k.description, k.status, k.assignee, k.resolution_notes, k.resolved_at, k.created_at, k.created_at
FROM tenants t JOIN auth_users u ON u.id = t.user_id CROSS JOIN k
WHERE u.username = 'tenant' AND u.role = 'tenant' AND t.unit_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM complaints c WHERE c.tenant_id = t.id AND c.title = k.title);

-- Demo tenancy agreement for active leases created above (the migration only covers leases that existed then).
UPDATE contracts SET agreement_name = 'Tenancy Agreement.pdf', agreement_size = 4404019, signed_at = start_date
WHERE agreement_name = '' AND status = 'active';
