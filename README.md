         # BUMATECH Setup Wizard
         
         ## Files
         - `setup-wizard.html` — wizard interface
         - `style.css` — mobile-first design
         - `app.js` — Supabase connection and wizard logic
         - `supabase_setup.sql` — database tables and RLS policies
         
         ## Setup
         1. Create a Supabase project.
         2. Open SQL Editor and run `supabase_setup.sql`.
         3. In Supabase Authentication, create/enable your login method.
         4. Open `app.js`.
         5. Replace:
            - `YOUR_SUPABASE_PROJECT_URL`
            - `YOUR_SUPABASE_ANON_KEY`
         6. Put all four files in the same website folder.
         7. Log in first, then open `setup-wizard.html`.
         
         ## Important
         The wizard requires an authenticated Supabase user. Never put a Supabase service-role key in browser JavaScript. Use only the project's public anon/publishable key.
         
         The school ID is the tenant identifier. Every class, subject, setting and staff record is linked to `school_id`, with RLS policies preventing normal users from reading another school's data.
         
         The logo preview is included. If you want actual logo upload to Storage, the next step is to add a school-specific upload path and save `logo_url` to `schools`.
         
         ## Suggested next pages
         - dashboard.html
         - students.html
         - teachers.html
         - parents.html
         - classes.html
         - marks.html
         - timetable.html
         - fees.html
         - attendance.html
         - sms.html
