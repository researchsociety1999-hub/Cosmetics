# SUPABASE_SETUP.md

## Supabase Integration Guide

This guide provides instructions on integrating Supabase into your project, setting up the database, and handling image uploads.

### Step 1: Setting Up Supabase
1. Visit [Supabase](https://supabase.io) and sign in or create a new account.
2. Create a new project, giving it a suitable name and selecting a region.
3. Note the API keys and URL provided in your project settings; you'll need these for integration.

### Step 2: Setting Up the Database
1. In the Supabase dashboard, navigate to the SQL editor section.
2. Use the SQL editor to initialize your database schema. For example:
   ```sql
   CREATE TABLE users (
       id SERIAL PRIMARY KEY,
       username VARCHAR(255) NOT NULL,
       email VARCHAR(255) UNIQUE NOT NULL,
       created_at TIMESTAMP DEFAULT NOW()
   );
   ```
3. After running the SQL script, check the table structure to ensure it's created.

### Step 3: Integrating Supabase into Your Application
1. Install the Supabase client library in your project:
   ```bash
   npm install @supabase/supabase-js
   ```
2. Initialize Supabase in your application as follows:
   ```javascript
   import { createClient } from '@supabase/supabase-js';
   
   const supabaseUrl = 'YOUR_SUPABASE_URL';
   const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
   const supabase = createClient(supabaseUrl, supabaseKey);
   ```

### Step 4: Handling Image Uploads
1. To upload images, create a storage bucket in the Supabase dashboard.
2. Use the following JavaScript code snippet to handle file uploads:
   ```javascript
   async function uploadImage(file) {
       const { data, error } = await supabase.storage.from('YOUR_BUCKET_NAME').upload(file.name, file);
       if (error) {
           console.error('Error uploading file:', error);
           return;
       }
       console.log('File uploaded successfully:', data);
   }
   ```
3. Call `uploadImage` with the file input from your user interface.

### Step 5: Retrieving Images
1. Retrieve the uploaded images using the following code:
   ```javascript
   const { data, error } = await supabase.storage.from('YOUR_BUCKET_NAME').list();
   if (error) {
       console.error('Error retrieving files:', error);
       return;
   }
   console.log('Files in bucket:', data);
   ```

### Conclusion
You should now have a functioning Supabase integration with database setup and image upload capabilities. For additional features, refer to the [Supabase documentation](https://supabase.io/docs).
