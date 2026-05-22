-- CreateTable
CREATE TABLE "normalization_aggregates" (
    "id" SERIAL NOT NULL,
    "age_min" DOUBLE PRECISION NOT NULL,
    "age_max" DOUBLE PRECISION NOT NULL,
    "popularity_min" DOUBLE PRECISION NOT NULL,
    "popularity_max" DOUBLE PRECISION NOT NULL,
    "vote_average_min" DOUBLE PRECISION NOT NULL,
    "vote_average_max" DOUBLE PRECISION NOT NULL,
    "language_to_index" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "normalization_aggregates_pkey" PRIMARY KEY ("id")
);
