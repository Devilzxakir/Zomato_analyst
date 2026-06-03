"""Zomato Data Analysis - generates stats and aggregations for the portfolio site."""
import json
import math
import re
from pathlib import Path

import numpy as np
import pandas as pd


def sanitize(obj):
    """Recursively replace NaN/Inf/-Inf with None in JSON-compatible structures."""
    if isinstance(obj, dict):
        return {k: sanitize(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [sanitize(v) for v in obj]
    if isinstance(obj, float):
        if math.isnan(obj) or math.isinf(obj):
            return None
    return obj

BASE = Path(__file__).parent
DATA_FILE = BASE / "zomato.csv"
OUT_DIR = BASE / "data"
OUT_DIR.mkdir(exist_ok=True)


def clean_rate(val):
    if pd.isna(val):
        return np.nan
    s = str(val).strip()
    if s in {"NEW", "-", ""}:
        return np.nan
    s = s.replace("/5", "").strip()
    try:
        return float(s)
    except ValueError:
        m = re.search(r"(\d+(\.\d+)?)", s)
        return float(m.group(1)) if m else np.nan


def clean_cost(val):
    if pd.isna(val):
        return np.nan
    s = str(val).replace(",", "").strip()
    try:
        return float(s)
    except ValueError:
        return np.nan


def main():
    print("Loading dataset...")
    df = pd.read_csv(DATA_FILE, low_memory=False)
    print(f"Rows loaded: {len(df)}")
    print(f"Columns: {list(df.columns)}")

    rows_before = len(df)
    missing_before = int(df.isna().sum().sum())

    # ----- Cleaning -----
    df = df.dropna(subset=["name", "location"]).copy()
    df["rate_num"] = df["rate"].apply(clean_rate)
    df["cost_for_two"] = df["approx_cost(for two people)"].apply(clean_cost)
    df["online_order"] = df["online_order"].astype(str).str.strip().str.title()
    df["book_table"] = df["book_table"].astype(str).str.strip().str.title()
    df["listed_type"] = df["listed_in(type)"].astype(str).str.strip()
    df["city"] = df["listed_in(city)"].astype(str).str.strip()
    df = df.drop_duplicates(subset=["name", "location", "address"])
    df["rate_num"] = df["rate_num"].fillna(df["rate_num"].median())
    df["cost_for_two"] = df["cost_for_two"].fillna(df["cost_for_two"].median())

    rows_after = len(df)
    missing_after = int(df[["name", "location", "rate_num", "cost_for_two"]].isna().sum().sum())
    missing_fixed = max(0, missing_before - missing_after)
    quality_score = round(100 * (1 - missing_after / (rows_after * 4)), 1)

    print(f"Rows after cleaning: {rows_after}")
    print(f"Missing values fixed: {missing_fixed}")
    print(f"Data quality score: {quality_score}")

    # ----- Overview KPIs -----
    total_restaurants = rows_after
    avg_rating = round(df["rate_num"].mean(), 2)
    total_votes = int(df["votes"].fillna(0).astype(int).sum())
    avg_cost = round(df["cost_for_two"].mean(), 2)
    online_pct = round((df["online_order"] == "Yes").mean() * 100, 1)
    booking_pct = round((df["book_table"] == "Yes").mean() * 100, 1)

    overview = {
        "totalRestaurants": total_restaurants,
        "avgRating": avg_rating,
        "totalVotes": total_votes,
        "avgCost": avg_cost,
        "onlineOrderPct": online_pct,
        "tableBookingPct": booking_pct,
    }
    print("Overview:", overview)

    cleaning = {
        "rowsBefore": rows_before,
        "rowsAfter": rows_after,
        "missingFixed": missing_fixed,
        "qualityScore": quality_score,
    }

    # ----- Rating distribution -----
    bins = [0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.01]
    labels = ["<1.5", "1.5-2.0", "2.0-2.5", "2.5-3.0", "3.0-3.5", "3.5-4.0", "4.0-4.5", "4.5+"]
    df["rate_bucket"] = pd.cut(df["rate_num"], bins=bins, labels=labels, right=False)
    rating_dist = (
        df["rate_bucket"].value_counts().reindex(labels, fill_value=0).reset_index()
    )
    rating_dist.columns = ["bucket", "count"]
    rating_dist_list = [
        {"bucket": str(row["bucket"]), "count": int(row["count"])}
        for _, row in rating_dist.iterrows()
    ]

    # ----- Restaurant type distribution -----
    rest_type_counts = (
        df["rest_type"].fillna("Unknown").str.split(", ").explode().value_counts().head(12)
    )
    rest_type_list = [{"type": k, "count": int(v)} for k, v in rest_type_counts.items()]

    listed_type_counts = df["listed_type"].value_counts()
    listed_type_list = [{"type": k, "count": int(v)} for k, v in listed_type_counts.items()]

    # ----- Online order vs rating -----
    online_vs_rating = (
        df.groupby("online_order")["rate_num"].agg(["mean", "count"]).reset_index()
    )
    online_vs_rating_list = [
        {"category": row["online_order"], "avgRating": round(float(row["mean"]), 2), "count": int(row["count"])}
        for _, row in online_vs_rating.iterrows()
    ]

    # ----- Table booking vs rating -----
    booking_vs_rating = (
        df.groupby("book_table")["rate_num"].agg(["mean", "count"]).reset_index()
    )
    booking_vs_rating_list = [
        {"category": row["book_table"], "avgRating": round(float(row["mean"]), 2), "count": int(row["count"])}
        for _, row in booking_vs_rating.iterrows()
    ]

    # ----- Cost vs rating scatter sample -----
    sample = df[["rate_num", "cost_for_two"]].dropna().sample(n=min(600, len(df)), random_state=42)
    cost_rating_scatter = [
        {"rating": round(float(row["rate_num"]), 2), "cost": float(row["cost_for_two"])}
        for _, row in sample.iterrows()
    ]

    # ----- Top 10 restaurants by votes -----
    top_votes = (
        df[["name", "location", "votes", "rate_num", "cost_for_two", "online_order", "book_table"]]
        .dropna(subset=["name"])
        .sort_values("votes", ascending=False)
        .head(10)
    )
    top_votes["votes"] = top_votes["votes"].fillna(0).astype(int)
    top_votes_list = [
        {
            "name": row["name"],
            "location": row["location"],
            "votes": int(row["votes"]),
            "rating": round(float(row["rate_num"]), 2),
            "cost": float(row["cost_for_two"]),
            "onlineOrder": row["online_order"],
            "bookTable": row["book_table"],
        }
        for _, row in top_votes.iterrows()
    ]

    # ----- Top rated restaurants (min 200 votes) -----
    top_rated = (
        df[df["votes"].fillna(0) > 200]
        .sort_values(["rate_num", "votes"], ascending=[False, False])
        .head(10)
    )
    top_rated_list = [
        {
            "name": row["name"],
            "location": row["location"],
            "rating": round(float(row["rate_num"]), 2),
            "votes": int(row["votes"]) if not pd.isna(row["votes"]) else 0,
            "cost": float(row["cost_for_two"]),
        }
        for _, row in top_rated.iterrows()
    ]

    # ----- Avg cost by restaurant type -----
    avg_cost_type = (
        df.dropna(subset=["rest_type"])
        .assign(rtype=df["rest_type"].str.split(", "))
        .explode("rtype")
        .groupby("rtype")
        .agg(avg_cost=("cost_for_two", "mean"), count=("name", "count"))
        .reset_index()
        .sort_values("count", ascending=False)
        .head(12)
    )
    avg_cost_list = [
        {"type": row["rtype"], "avgCost": round(float(row["avg_cost"]), 2), "count": int(row["count"])}
        for _, row in avg_cost_type.iterrows()
    ]

    # ----- Top cuisines -----
    cuisine_counts = (
        df["cuisines"].fillna("").str.split(", ").explode()
        .str.strip()
        .replace("", np.nan).dropna()
        .value_counts()
        .head(12)
    )
    cuisine_list = [{"cuisine": k, "count": int(v)} for k, v in cuisine_counts.items()]

    # ----- City distribution -----
    city_counts = df["city"].value_counts().head(15)
    city_list = [{"city": k, "count": int(v)} for k, v in city_counts.items()]

    # ----- Price range ratings -----
    df["price_range"] = pd.cut(
        df["cost_for_two"],
        bins=[0, 300, 600, 1000, 1500, 3000, 100000],
        labels=["<300", "300-600", "600-1000", "1000-1500", "1500-3000", "3000+"],
    )
    price_rating = (
        df.groupby("price_range", observed=True)
        .agg(avg_rating=("rate_num", "mean"), count=("name", "count"))
        .reset_index()
    )
    price_rating_list = [
        {
            "range": str(row["price_range"]),
            "avgRating": round(float(row["avg_rating"]), 2),
            "count": int(row["count"]),
        }
        for _, row in price_rating.iterrows()
    ]

    # ----- SQL-style query results -----
    sql_results = {}

    q1 = (
        df[df["votes"].fillna(0) > 500]
        .sort_values(["rate_num", "votes"], ascending=[False, False])
        .head(10)[["name", "location", "rate_num", "votes", "cost_for_two"]]
    )
    sql_results["topByRating"] = [
        {
            "name": row["name"],
            "location": row["location"],
            "rating": round(float(row["rate_num"]), 2),
            "votes": int(row["votes"]) if not pd.isna(row["votes"]) else 0,
            "cost": float(row["cost_for_two"]),
        }
        for _, row in q1.iterrows()
    ]

    q2 = (
        df.dropna(subset=["rest_type"])
        .assign(rtype=df["rest_type"].str.split(", "))
        .explode("rtype")
        .groupby("rtype")
        .agg(avg_rating=("rate_num", "mean"), count=("name", "count"))
        .reset_index()
        .sort_values("avg_rating", ascending=False)
        .head(12)
    )
    sql_results["avgRatingByType"] = [
        {
            "type": row["rtype"],
            "avgRating": round(float(row["avg_rating"]), 2),
            "count": int(row["count"]),
        }
        for _, row in q2.iterrows()
    ]

    sql_results["onlineOrdering"] = [
        {
            "name": row["name"],
            "location": row["location"],
            "rating": round(float(row["rate_num"]), 2),
            "votes": int(row["votes"]) if not pd.isna(row["votes"]) else 0,
        }
        for _, row in df[df["online_order"] == "Yes"]
        .sort_values("votes", ascending=False)
        .head(10)
        .iterrows()
    ]

    sql_results["highestVoted"] = top_votes_list

    q5 = (
        df.groupby("listed_type")
        .agg(
            avg_cost=("cost_for_two", "mean"),
            min_cost=("cost_for_two", "min"),
            max_cost=("cost_for_two", "max"),
            count=("name", "count"),
        )
        .reset_index()
        .sort_values("count", ascending=False)
    )
    sql_results["costByCategory"] = [
        {
            "category": row["listed_type"],
            "avgCost": round(float(row["avg_cost"]), 2),
            "minCost": round(float(row["min_cost"]), 2),
            "maxCost": round(float(row["max_cost"]), 2),
            "count": int(row["count"]),
        }
        for _, row in q5.iterrows()
    ]

    # ----- Business insights -----
    online_yes_rate = float(df.loc[df["online_order"] == "Yes", "rate_num"].mean())
    online_no_rate = float(df.loc[df["online_order"] == "No", "rate_num"].mean())
    booking_yes_rate = float(df.loc[df["book_table"] == "Yes", "rate_num"].mean())
    booking_no_rate = float(df.loc[df["book_table"] == "No", "rate_num"].mean())

    best_type_row = max(sql_results["avgRatingByType"], key=lambda x: x["avgRating"])
    best_price_row = max(price_rating_list, key=lambda x: x["avgRating"])
    most_voted = top_votes_list[0] if top_votes_list else None

    insights = {
        "onlineVsRating": {
            "withOnline": round(online_yes_rate, 2),
            "withoutOnline": round(online_no_rate, 2),
            "delta": round(online_yes_rate - online_no_rate, 2),
        },
        "bookingVsRating": {
            "withBooking": round(booking_yes_rate, 2),
            "withoutBooking": round(booking_no_rate, 2),
            "delta": round(booking_yes_rate - booking_no_rate, 2),
        },
        "bestRestaurantType": best_type_row,
        "bestPriceRange": best_price_row,
        "mostEngaged": most_voted,
    }

    filter_options = {
        "restTypes": sorted(
            df["rest_type"].fillna("Unknown")
            .str.split(", ").explode().str.strip().unique().tolist()
        )[:40],
        "cities": sorted(df["city"].unique().tolist()),
        "onlineOptions": ["Yes", "No"],
        "bookingOptions": ["Yes", "No"],
    }

    # ----- Save dataset sample (cleaned) for in-browser interactive dashboard -----
    sample_size = 1500
    clean_sample = (
        df[["name", "location", "rest_type", "cuisines", "rate_num", "votes", "cost_for_two", "online_order", "book_table", "listed_type", "city"]]
        .rename(columns={"rate_num": "rating", "cost_for_two": "cost"})
        .fillna({"rating": 0, "votes": 0, "cost": 0})
        .astype({"votes": int, "cost": int})
        .sample(n=sample_size, random_state=7)
    )
    clean_sample_records = clean_sample.to_dict(orient="records")
    for r in clean_sample_records:
        r["rating"] = round(float(r["rating"]), 2)

    bundle = {
        "overview": overview,
        "cleaning": cleaning,
        "ratingDistribution": rating_dist_list,
        "restTypeDistribution": rest_type_list,
        "listedTypeDistribution": listed_type_list,
        "onlineVsRating": online_vs_rating_list,
        "bookingVsRating": booking_vs_rating_list,
        "costVsRating": cost_rating_scatter,
        "topByVotes": top_votes_list,
        "topRated": top_rated_list,
        "avgCostByType": avg_cost_list,
        "cuisines": cuisine_list,
        "cities": city_list,
        "priceRangeRating": price_rating_list,
        "sqlResults": sql_results,
        "insights": insights,
        "filterOptions": filter_options,
        "cleanSample": clean_sample_records,
    }

    out_file = OUT_DIR / "analytics.json"
    bundle = sanitize(bundle)
    # Also fix cuisines NaN that became None in cleanSample
    for r in bundle.get("cleanSample", []):
        for k in ("name", "location", "rest_type", "cuisines", "online_order", "book_table", "listed_type", "city"):
            if r.get(k) is None:
                r[k] = "Unknown"
    with out_file.open("w", encoding="utf-8") as f:
        json.dump(bundle, f, ensure_ascii=False, indent=2)

    print(f"\nWrote analytics to {out_file} ({out_file.stat().st_size/1024:.1f} KB)")


if __name__ == "__main__":
    main()
