-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movie" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "external_id" INTEGER NOT NULL,
    "original_language" VARCHAR(50) NOT NULL,
    "overview" TEXT NOT NULL,
    "popularity" DOUBLE PRECISION NOT NULL,
    "poster_path" VARCHAR(255),
    "adult" BOOLEAN NOT NULL,
    "release_date" TIMESTAMP(3) NOT NULL,
    "vote_average" DECIMAL(65,30) NOT NULL,
    "vote_count" INTEGER NOT NULL,

    CONSTRAINT "movie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_movie" (
    "user_id" INTEGER NOT NULL,
    "movie_id" INTEGER NOT NULL,

    CONSTRAINT "user_movie_pkey" PRIMARY KEY ("user_id","movie_id")
);

-- CreateIndex
CREATE INDEX "user_movie_movie_id_idx" ON "user_movie"("movie_id");

-- AddForeignKey
ALTER TABLE "user_movie" ADD CONSTRAINT "user_movie_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_movie" ADD CONSTRAINT "user_movie_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;
