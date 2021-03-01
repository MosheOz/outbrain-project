const express = require("express");
const cors = require("cors");

const request = require("request");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const token =
  "MTYxMzExNjQ4NDQwODpiZTE3NWIxMTRkMGM3MDM4ZWM0OGMwZDA0MmU1Y2RkM2IzNmFkZTQyMGNjNDc5YzI3MjZhNGY4NjVjOTA5MTkzOTg1Y2FjMGRhNzIyYTZkYmJhMGMzN2E1MDdmNTY4ZGQ5NzBjZjY1MTEyMDdjNGY5MzFkMWU2ZTRlOWE5MmUzZGMzZmNmZWI4MDIyOWMyYzAyMzQ3M2Q3MWZkNWRkOTAzMjk0ZjE4MjgzZGQ5ZTQwZDMyOWQ3YmQxMWRhNTVkMWQ4MGNjOWU4ZjZhZTkzMDlkMTgxYzIxZmNjZDlmYWFlMTkyM2E5NDU0Y2QwNmVlZmJjNWQ5NWMxYjQ3NTY4NjA5ZTk3YzgyNmYwZmY2ZjlmNmQ4MGQ3YzRmNzUwOTkxODAxMjYwNzFkMDYyNzk5YmViNjlhMmE0YTdmZWRkNjZkYjhiMzBkMGJmZDhhNWY0ZjhiZTQ5OWVmZWFiMjg0OTBjYjBkMGYxMDNiMWRkNmY0N2EzMGM0NThmZDRmOWVjMWIwZGMwM2Q2NDkzNTBmNzdlMTgyNjAzZTcwN2EwMWIyZDMxMDkwNGUxZWZlNzRjZDdkZGE5OTQ1YzQ3YWE2YjgzYjEwNmZiZTVkMThkZWI2OGMzMzdhMzNlZTM1ZDE2MDRkYjBmMGVjYjAxYzQ3ZDQ4YTZjN2U0YjI0MmNmNDEwMTp7ImNhbGxlckFwcGxpY2F0aW9uIjoiQW1lbGlhIiwiaXBBZGRyZXNzIjoiNzcuMTI2LjY1LjIzIiwiYnlwYXNzQXBpQXV0aCI6ImZhbHNlIiwidXNlck5hbWUiOiJhbWlyLmdhdEBhcG9yaWFsdGQuY29tIiwidXNlcklkIjoiMTA2NTgwMjciLCJkYXRhU291cmNlVHlwZSI6Ik1ZX09CX0NPTSJ9OjU1ZjdiYjIzNDNkOTk0MjEwZThlODc3Y2Q5NjFjZjg3NGU4ZjAwYTJkZTBjNGM3N2JhZWIwODJjODZmNTZlMzNlOThlYjJhYmZmMzMyYzExMDAyZDFiNjdjOTljNGFkOWQwZWYxODYzNWEwMzIxZTcwOTE3NjIxMTQ4ODNiOWY5";

const memberId = "00634b8160c24e3b063c76549f9404c0a1";
const app = express();
app.use(cors());
app.use(express.json());

// ANSWER_1

// get global data by campaign id
app.use("/get-campaign/:camp?", async (req, res) => {
  const campaign = req.params.camp || "00be63761f129a6aa7b0c09b12d56b1241";
  request(
    {
      method: "GET",
      url: `https://api.outbrain.com/amplify/v0.1/campaigns/${campaign}`,
      headers: {
        "OB-TOKEN-V1": token,
      },
    },
    (error, response, body) => {
      if (error) {
        res.status(500).json(error);
        return;
      }
      const result = JSON.parse(body);
      res.status(200).json(result);
    }
  );
});

// ANSWER_2

// get jan2021 campaigns with the following == campaign name, campaign id, spend, conversions, clicks
app.use("/get-campaigns", async (req, res) => {
  request(
    {
      method: "GET",
      url: `https://api.outbrain.com/amplify/v0.1/reports/marketers/${memberId}/campaigns?from=2021-01-01&to=2021-01-02`,
      headers: {
        "OB-TOKEN-V1": token,
      },
    },
    async (error, response, body) => {
      if (error) {
        res.status(500).json(error);
        return;
      }
      const result = JSON.parse(body);
      const resultsForCsv = result.results.map((data) => {
        let obj = data;
        return {
          id: obj.metadata.id,
          name: obj.metadata.name,
          spend: obj.metrics.spend,
          conversions: obj.metrics.conversions,
          clicks: obj.metrics.clicks,
        };
      });
      try {
        const csvWriter = createCsvWriter({
          path: "public/file.csv",
          header: [
            { id: "id", title: "ID" },
            { id: "name", title: "NAME" },
            { id: "spend", title: "SPEND" },
            { id: "conversions", title: "CONVERSIONS" },
            { id: "clicks", title: "CLICKS" },
          ],
        });
        await csvWriter.writeRecords(resultsForCsv);
        const file = "./public/file.csv";
        res.download(file);
      } catch (err) {
        res.status(500).json(err);
      }
    }
  );
});

// ANSWER_3

app.use("/get-campaign-by-spend/:spend?", async (req, res) => {
  const amount = req.params.spend || "100";
  request(
    {
      method: "GET",
      url: `https://api.outbrain.com/amplify/v0.1/reports/marketers/${memberId}/campaigns?from=2000-01-01&to=2021-01-02`,
      headers: {
        "OB-TOKEN-V1": token,
      },
    },
    (error, response, body) => {
      if (error) {
        res.status(500).json(error);
        return;
      }
      const result = JSON.parse(body);
      const filteredResults = result.results.filter(
        (data) => data.metrics.spend >= amount
      );
      res.status(200).json(filteredResults);
    }
  );
});

const PORT = 3000;

app.listen(PORT, () => console.log("Server in running on port ", PORT));
