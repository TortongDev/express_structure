-- CreateTable
CREATE TABLE "langs" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "th_TH" TEXT NOT NULL,
    "en_US" TEXT NOT NULL,
    "route_path" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "langs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "langs_code_key" ON "langs"("code");
