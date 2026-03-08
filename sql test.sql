# If you want to keep your static files separate, create a subfolder
mkdir next-app
cd next-app

# Create Next.js project (use TypeScript for better Supabase types)
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"