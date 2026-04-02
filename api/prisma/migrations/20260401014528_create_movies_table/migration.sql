-- CreateTable
CREATE TABLE "Movie" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "external_id" INTEGER NOT NULL,
    "original_language" VARCHAR(50) NOT NULL,
    "overview" TEXT NOT NULL,
    "popularity" DOUBLE PRECISION NOT NULL,
    "poster_path" VARCHAR(255) NULL,
    "adult" BOOLEAN NOT NULL,
    "release_date" TIMESTAMP(3) NOT NULL,
    "vote_average" DECIMAL(65,30) NOT NULL,
    "vote_count" INTEGER NOT NULL,

    CONSTRAINT "Movie_pkey" PRIMARY KEY ("id")
);
