-- rotate seeded account passwords
UPDATE auth_users SET password_hash = '$2a$10$ienx7DKprPS0aXovD3MNk.6YudPdCz0kkj8zF9OwQqAm5hUFNuuW2' WHERE username = 'admin';
UPDATE auth_users SET password_hash = '$2a$10$xtGG3R//Xhkk7hTagfEMoOgPehP9jOxU2sWkZgq.urxzX6goiF9ZW' WHERE username = 'tenant';
UPDATE auth_users SET password_hash = '$2a$10$tRyJoTrTVXtjSU7PjlhSdOrJb.4eA3U54jcPg7LcUYRLSvucEV15e' WHERE username IN (
    'tenant_john_tan', 'tenant_elena_rostova', 'tenant_marcus_lee', 'tenant_sophie_martin', 'tenant_david_wong',
    'tenant_sarah_ahmad', 'tenant_grace', 'tenant_henry', 'tenant_ivan', 'tenant_judy',
    'tenant_kevin', 'tenant_laura', 'tenant_mike', 'tenant_nina', 'tenant_oscar',
    'tenant_paula', 'tenant_quinn', 'tenant_rachel', 'tenant_sam', 'tenant_tina',
    'tenant_umar', 'tenant_vera', 'tenant_will', 'tenant_xin', 'tenant_yara',
    'tenant_zack', 'tenant_amy', 'tenant_ben', 'tenant_chloe', 'tenant_daniel',
    'tenant_emma', 'tenant_felix', 'tenant_gina', 'tenant_hugo', 'tenant_iris',
    'tenant_jack', 'tenant_kara', 'tenant_leo', 'tenant_mia', 'tenant_noah',
    'tenant_olivia', 'tenant_peter', 'tenant_ruby', 'tenant_sophie', 'tenant_tom',
    'tenant_uma', 'tenant_victor', 'tenant_wendy'
);
-- staff_accounts keeps a copy of the root admin hash (see SeedRootAdmin); keep it in sync.
UPDATE staff_accounts SET password_hash = '$2a$10$ienx7DKprPS0aXovD3MNk.6YudPdCz0kkj8zF9OwQqAm5hUFNuuW2' WHERE username = 'admin';
