# Zomato Analyst

End-to-end data analysis pipeline for the Zomato Bangalore restaurants dataset. The script cleans raw listings, computes KPIs, runs SQL-style aggregations, and writes a single `data/analytics.json` bundle ready to be consumed by a static dashboard (the `web/` app).

## Repository layout

```
.
├── analyze.py              # Main analysis pipeline
├── zomato.csv              # Input dataset (not in repo — see below)
├── data/
│   └── analytics.json      # Generated output (also gitignored if large)
├── web/                    # Static dashboard that consumes analytics.json
│   ├── dist/               # Built site
│   └── public/             # Source assets
└── README.md
```

## Dataset

The pipeline expects `zomato.csv` in the project root with the standard Zomato Bangalore columns:

`name, online_order, book_table, rate, votes, location, rest_type, cuisines, approx_cost(for two people), listed_in(type), listed_in(city), address`

The CSV is intentionally **not** committed (size + licensing). Download it from the original Kaggle source and place it next to `analyze.py`.

## Prerequisites

- Python 3.9+
- `pandas`, `numpy`

## Install

```bash
python -m pip install pandas numpy
```

## Usage

1. Place `zomato.csv` in the project root.
2. Run the pipeline:

   ```bash
   python analyze.py
   ```

3. The script writes a sanitized bundle to `data/analytics.json`. Console output shows the cleaning summary, KPIs, and progress through each section.

4. To view the dashboard, serve the static site:

   ```bash
   cd web
   python -m http.server 8080
   ```

   Then open http://localhost:8080 in your browser.

## What the pipeline produces

`data/analytics.json` contains:

| Section | Description |
| --- | --- |
| `overview` | Total restaurants, average rating, total votes, average cost for two, online-order %, table-booking % |
| `cleaning` | Rows before/after, missing values fixed, data quality score |
| `ratingDistribution` | Histogram of ratings in 0.5-point buckets |
| `restTypeDistribution` | Top restaurant types (multi-valued `rest_type` exploded) |
| `listedTypeDistribution` | Count per `listed_in(type)` |
| `onlineVsRating` | Average rating grouped by `online_order` |
| `bookingVsRating` | Average rating grouped by `book_table` |
| `costVsRating` | Sampled scatter (600 points) for the cost-vs-rating chart |
| `topByVotes` | Top 10 restaurants by vote count |
| `topRated` | Top 10 restaurants with `votes > 200`, sorted by rating |
| `avgCostByType` | Average cost for two per restaurant type |
| `cuisines` | Top 12 cuisines by frequency |
| `cities` | Top 15 cities by restaurant count |
| `priceRangeRating` | Average rating per price bucket (`<300`, `300-600`, …) |
| `sqlResults` | Five SQL-style aggregations: `topByRating`, `avgRatingByType`, `onlineOrdering`, `highestVoted`, `costByCategory` |
| `insights` | Business insights: online-order delta, table-booking delta, best restaurant type, best price range, most engaged restaurant |
| `filterOptions` | Available values for the dashboard's filter controls |
| `cleanSample` | 1,500-row cleaned sample for the in-browser interactive view |

## Cleaning steps

- Drop rows missing `name` or `location`.
- Parse `rate` (handles `"4.1/5"`, `"NEW"`, `"-"`).
- Parse `approx_cost(for two people)` (strips thousands separators).
- Normalize `online_order` / `book_table` to `Yes` / `No`.
- Deduplicate on `(name, location, address)`.
- Fill missing ratings and costs with the column median.

## Notes

- The dashboard in `web/` is fully static — it fetches `data/analytics.json` at runtime, so rebuilding analytics is enough; no API server required.
- `sanitize()` is applied before serialization to replace `NaN` / `Inf` with `null` so the JSON is valid for browser consumption.
