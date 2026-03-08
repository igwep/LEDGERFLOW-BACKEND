# SQLite Schema (simpler for local development)

# Replace Decimal with Float in prisma/schema.prisma:
# balance       Float    @default(0)
# available     Float    @default(0)  
# lockedBalance Float    @default(0)
# amount        Float

# Then update .env:
# DATABASE_URL="file:./dev.db"

# Commands:
# npm run db:push
# npm run db:studio
