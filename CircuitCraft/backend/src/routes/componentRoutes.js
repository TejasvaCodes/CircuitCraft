import { Router } from "express";
import { searchComponentsByMpn } from "../integrations/nexarComponents.js";

const router = Router();

router.get("/search", async (req, res, next) => {
  try {
    const q = String(req.query.q || "").trim();
    if (q.length < 2) {
      return res.status(400).json({ error: "Enter at least 2 characters to search." });
    }
    if (q.length > 80) {
      return res.status(400).json({ error: "Search text must be 80 characters or fewer." });
    }

    const data = await searchComponentsByMpn(q, req.query.limit);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

export default router;
