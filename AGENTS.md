# Architecture rules
- Keep product catalog data in a dedicated public table with public read and server-validated admin writes; ten numbered slots remain reusable after deletion.
- Purchase registration is contact information, not authenticated identity: store it privately with insert-only public access and retain it only for the browser session; WhatsApp links cannot select or verify the sender account.
- Service video slots use the existing admin-protected site settings and a dedicated private storage bucket with public signed reads; refresh signed links before expiry and use native inline video controls.
- Keep executable tests outside src so test-runner modules are not included in the browser TypeScript project.