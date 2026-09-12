-- AlterTable
ALTER TABLE "Creator" ADD COLUMN "headline" TEXT;
ALTER TABLE "Creator" ADD COLUMN "linkedInUrl" TEXT;

-- CreateTable
CREATE TABLE "CreatorProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "linkedInUrl" TEXT,
    "headline" TEXT,
    "onboardingComplete" BOOLEAN NOT NULL DEFAULT false,
    "referralCode" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CreatorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CreatorProfile_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CampaignApplication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CampaignApplication_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CampaignApplication_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MessageThread" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspaceId" TEXT,
    "creatorId" TEXT,
    "collaborationId" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "title" TEXT NOT NULL,
    CONSTRAINT "MessageThread_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MessageThread_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "MessageThread_collaborationId_fkey" FOREIGN KEY ("collaborationId") REFERENCES "Collaboration" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_MessageThread" ("collaborationId", "creatorId", "id", "isSystem", "title", "workspaceId") SELECT "collaborationId", "creatorId", "id", "isSystem", "title", "workspaceId" FROM "MessageThread";
DROP TABLE "MessageThread";
ALTER TABLE "new_MessageThread" RENAME TO "MessageThread";
CREATE UNIQUE INDEX "MessageThread_collaborationId_key" ON "MessageThread"("collaborationId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "CreatorProfile_userId_key" ON "CreatorProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CreatorProfile_creatorId_key" ON "CreatorProfile"("creatorId");

-- CreateIndex
CREATE UNIQUE INDEX "CreatorProfile_referralCode_key" ON "CreatorProfile"("referralCode");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignApplication_campaignId_creatorId_key" ON "CampaignApplication"("campaignId", "creatorId");
