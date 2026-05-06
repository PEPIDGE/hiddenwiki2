"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { GlitchText } from "@/components/tor/glitch-text"
import { motion } from "framer-motion"
import { getGameState, saveGameState, addClue } from "@/lib/game-state"

const ACCENT = "#FFD700"

type DocCategory =
  | "\u041b\u0418\u0427\u041d\u0418 \u041a\u0410\u0420\u0422\u0418 / \u041f\u0410\u0421\u041f\u041e\u0420\u0422\u0418"
  | "\u0428\u041e\u0424\u042c\u041e\u0420\u0421\u041a\u0418 \u041a\u041d\u0418\u0416\u041a\u0418"
  | "\u0414\u0410\u041d\u0410\u0427\u041d\u0418 \u0414\u041e\u041a\u0423\u041c\u0415\u041d\u0422\u0418"
  | "\u0422\u0420\u0423\u0414\u041e\u0412\u0418 \u0414\u041e\u0413\u041e\u0412\u041e\u0420\u0418"
  | "\u0424\u0418\u0420\u041c\u0415\u041d\u0418 \u0414\u041e\u0413\u041e\u0412\u041e\u0420\u0418"
  | "\u041f\u0420\u0415\u0417\u0415\u041d\u0422\u0410\u0426\u0418\u0418"
  | "\u041b\u0418\u0427\u041d\u0418 \u0421\u041d\u0418\u041c\u041a\u0418 / \u0412\u0418\u0414\u0415\u041e"
  | "\u041f\u041e\u041b\u0418\u0426\u0415\u0419\u0421\u041a\u0418 / \u0421\u042a\u0414\u0415\u0411\u041d\u0418"
  | "\u0418\u041c\u041e\u0422\u041d\u0418 \u0414\u041e\u041a\u0423\u041c\u0415\u041d\u0422\u0418"

interface Doc {
  id: string
  name: string
  category: DocCategory
  ext: string
  date: string
  size: string
  source: string
  preview: string
  tags: string[]
}

const CAT_ID    = "\u041b\u0418\u0427\u041d\u0418 \u041a\u0410\u0420\u0422\u0418 / \u041f\u0410\u0421\u041f\u041e\u0420\u0422\u0418"
const CAT_DL    = "\u0428\u041e\u0424\u042c\u041e\u0420\u0421\u041a\u0418 \u041a\u041d\u0418\u0416\u041a\u0418"
const CAT_TAX   = "\u0414\u0410\u041d\u0410\u0427\u041d\u0418 \u0414\u041e\u041a\u0423\u041c\u0415\u041d\u0422\u0418"
const CAT_HR    = "\u0422\u0420\u0423\u0414\u041e\u0412\u0418 \u0414\u041e\u0413\u041e\u0412\u041e\u0420\u0418"
const CAT_CORP  = "\u0424\u0418\u0420\u041c\u0415\u041d\u0418 \u0414\u041e\u0413\u041e\u0412\u041e\u0420\u0418"
const CAT_PPT   = "\u041f\u0420\u0415\u0417\u0415\u041d\u0422\u0410\u0426\u0418\u0418"
const CAT_IMG   = "\u041b\u0418\u0427\u041d\u0418 \u0421\u041d\u0418\u041c\u041a\u0418 / \u0412\u0418\u0414\u0415\u041e"
const CAT_LAW   = "\u041f\u041e\u041b\u0418\u0426\u0415\u0419\u0421\u041a\u0418 / \u0421\u042a\u0414\u0415\u0411\u041d\u0418"
const CAT_PROP  = "\u0418\u041c\u041e\u0422\u041d\u0418 \u0414\u041e\u041a\u0423\u041c\u0415\u041d\u0422\u0418"

const DOCS: Doc[] = [
  {
    id: "D-001",
    name: "id_scan_petar_ivanov_90.jpg",
    category: CAT_ID,
    ext: "JPG",
    date: "2025-10-02",
    size: "184 KB",
    source: "anon_dump_@leakbot",
    preview: "\u0421\u043a\u0430\u043d\u0438\u0440\u0430\u043d\u0430 \u043b\u0438\u0447\u043d\u0430 \u043a\u0430\u0440\u0442\u0430: \u041f\u0435\u0442\u044a\u0440 \u0418\u0432\u0430\u043d\u043e\u0432 \u041f\u0435\u0442\u0440\u043e\u0432, \u0415\u0413\u041d 9004**1234, \u0438\u0437\u0434\u0430\u0434\u0435\u043d\u0430 \u041c\u0412\u0420 \u041f\u043b\u043e\u0432\u0434\u0438\u0432 2021. \u0410\u0434\u0440\u0435\u0441: \u0443\u043b. \u0420\u043e\u0437\u0430 14, \u0435\u0442. 3. \u0411\u0435\u0437 \u0432\u0440\u044a\u0437\u043a\u0430 \u0441 \u043e\u0441\u043d\u043e\u0432\u043d\u0438\u044f \u0441\u043b\u0443\u0447\u0430\u0439.",
    tags: ["\u043b\u0438\u0447\u043d\u0430 \u043a\u0430\u0440\u0442\u0430", "scan", "\u043b\u0438\u0447\u043d\u0438 \u0434\u0430\u043d\u043d\u0438"],
  },
  {
    id: "D-002",
    name: "passport_maria_kostadinova.jpg",
    category: CAT_ID,
    ext: "JPG",
    date: "2025-10-08",
    size: "210 KB",
    source: "anon_dump_@leakbot",
    preview: "\u041f\u0430\u0441\u043f\u043e\u0440\u0442: \u041c\u0430\u0440\u0438\u044f \u041a\u043e\u0441\u0442\u0430\u0434\u0438\u043d\u043e\u0432\u0430 \u0418\u0432\u0430\u043d\u043e\u0432\u0430, \u2116 BG7854321, \u0432\u0430\u043b\u0438\u0434\u0435\u043d \u0434\u043e 2028. \u0421\u043d\u0438\u043c\u043a\u0430\u0442\u0430 \u0435 \u0447\u0430\u0441\u0442\u0438\u0447\u043d\u043e \u0437\u0430\u043c\u044a\u0433\u043b\u0435\u043d\u0430. \u041b\u0438\u0446\u0435\u0442\u043e \u043d\u0435 \u0435 \u0438\u0434\u0435\u043d\u0442\u0438\u0444\u0438\u0446\u0438\u0440\u0430\u043d\u043e \u0432 \u0441\u043b\u0443\u0447\u0430\u044f.",
    tags: ["\u043f\u0430\u0441\u043f\u043e\u0440\u0442", "scan", "\u043b\u0438\u0447\u043d\u0438 \u0434\u0430\u043d\u043d\u0438"],
  },
  {
    id: "D-003",
    name: "driving_license_georgi_stoyanov.jpg",
    category: CAT_DL,
    ext: "JPG",
    date: "2025-09-29",
    size: "96 KB",
    source: "paste_mirror_09",
    preview: "\u0428\u043e\u0444\u044c\u043e\u0440\u0441\u043a\u0430 \u043a\u043d\u0438\u0436\u043a\u0430: \u0413\u0435\u043e\u0440\u0433\u0438 \u041a\u0440\u0430\u0441\u0438\u043c\u0438\u0440\u043e\u0432 \u0421\u0442\u043e\u044f\u043d\u043e\u0432, \u043a\u0430\u0442. B/C, \u0438\u0437\u0434\u0430\u0434\u0435\u043d\u0430 2019, \u0432\u0430\u043b\u0438\u0434\u043d\u0430 \u0434\u043e 2029. \u0415\u0413\u041d \u0447\u0430\u0441\u0442\u0438\u0447\u043d\u043e \u0432\u0438\u0434\u0438\u043c. \u041d\u0435 \u0441\u044a\u043e\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0430 \u043d\u0430 \u043d\u0438\u0442\u043e \u0435\u0434\u043d\u043e \u041f\u041f\u0421 \u0432 \u0441\u043b\u0443\u0447\u0430\u044f.",
    tags: ["\u0448\u043e\u0444\u044c\u043e\u0440\u0441\u043a\u0430 \u043a\u043d\u0438\u0436\u043a\u0430", "\u043b\u0438\u0447\u043d\u0438 \u0434\u0430\u043d\u043d\u0438"],
  },
  {
    id: "D-004",
    name: "driving_license_elena_dimitrova.pdf",
    category: CAT_DL,
    ext: "PDF",
    date: "2025-10-11",
    size: "74 KB",
    source: "paste_mirror_09",
    preview: "\u0428\u043e\u0444\u044c\u043e\u0440\u0441\u043a\u0430 \u043a\u043d\u0438\u0436\u043a\u0430: \u0415\u043b\u0435\u043d\u0430 \u0412\u0430\u043b\u0435\u043d\u0442\u0438\u043d\u043e\u0432\u0430 \u0414\u0438\u043c\u0438\u0442\u0440\u043e\u0432\u0430, \u043a\u0430\u0442. B, \u0438\u0437\u0434\u0430\u0434\u0435\u043d\u0430 \u041c\u0412\u0420 \u0412\u0430\u0440\u043d\u0430 2022. \u0410\u0434\u0440\u0435\u0441\u044a\u0442 \u043d\u0430 \u0433\u044a\u0440\u0431\u0430 \u0435 \u043d\u0435\u0447\u0435\u0442\u043b\u0438\u0432. \u0411\u0435\u0437 \u043e\u0442\u043d\u043e\u0448\u0435\u043d\u0438\u0435 \u043a\u044a\u043c \u0440\u0430\u0437\u0441\u043b\u0435\u0434\u0432\u0430\u043d\u0435\u0442\u043e.",
    tags: ["\u0448\u043e\u0444\u044c\u043e\u0440\u0441\u043a\u0430 \u043a\u043d\u0438\u0436\u043a\u0430", "\u043b\u0438\u0447\u043d\u0438 \u0434\u0430\u043d\u043d\u0438"],
  },
  {
    id: "D-005",
    name: "tax_declaration_2024_nikolov_a.pdf",
    category: CAT_TAX,
    ext: "PDF",
    date: "2025-04-30",
    size: "118 KB",
    source: "nap_leak_mirror",
    preview: "\u0414\u0430\u043d\u044a\u0447\u043d\u0430 \u0434\u0435\u043a\u043b\u0430\u0440\u0430\u0446\u0438\u044f \u043e\u0431\u0440. 2001 \u0437\u0430 2024 \u0433.: \u0410\u043b\u0435\u043a\u0441\u0430\u043d\u0434\u044a\u0440 \u041d\u0438\u043a\u043e\u043b\u043e\u0432, \u0414\u041e\u0418 8392****. \u0414\u043e\u0445\u043e\u0434\u0438 \u043e\u0442 \u0442\u0440\u0443\u0434\u043e\u0432\u043e \u043f\u0440\u0430\u0432\u043e\u043e\u0442\u043d\u043e\u0448\u0435\u043d\u0438\u0435: 38 400 \u043b\u0432. \u0421\u0442\u0430\u043d\u0434\u0430\u0440\u0442\u0435\u043d \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442, \u0431\u0435\u0437 \u043d\u0435\u0440\u0435\u0434\u043d\u043e\u0441\u0442\u0438.",
    tags: ["\u0434\u0430\u043d\u044a\u0447\u043d\u0430 \u0434\u0435\u043a\u043b\u0430\u0440\u0430\u0446\u0438\u044f", "\u041d\u0410\u041f", "\u0444\u0438\u0437\u0438\u0447\u0435\u0441\u043a\u043e \u043b\u0438\u0446\u0435"],
  },
  {
    id: "D-006",
    name: "vat_return_zvezda_eood_q3_2025.xlsx",
    category: CAT_TAX,
    ext: "XLSX",
    date: "2025-10-14",
    size: "52 KB",
    source: "nap_leak_mirror",
    preview: "\u0414\u0414\u0421 \u0434\u0435\u043a\u043b\u0430\u0440\u0430\u0446\u0438\u044f \u0437\u0430 Q3 2025: \u0417\u0432\u0435\u0437\u0434\u0430 \u0415\u041e\u041e\u0414, \u0415\u0418\u041a 2059****. \u041d\u0430\u0447\u0438\u0441\u043b\u0435\u043d \u0414\u0414\u0421 12 800 \u043b\u0432, \u043f\u0440\u0438\u0441\u043f\u0430\u0434\u043d\u0430\u0442 9 400 \u043b\u0432. \u0420\u0435\u0434\u043e\u0432\u043d\u0430 \u0434\u0435\u043a\u043b\u0430\u0440\u0430\u0446\u0438\u044f, \u0431\u0435\u0437 \u0434\u0430\u043d\u044a\u0447\u043d\u0438 \u043d\u0430\u0440\u0443\u0448\u0435\u043d\u0438\u044f.",
    tags: ["\u0414\u0414\u0421", "\u0444\u0438\u0440\u043c\u0430", "\u0434\u0430\u043d\u044a\u0447\u043d\u0438"],
  },
  {
    id: "D-007",
    name: "work_contract_dimitrova_e_2024.pdf",
    category: CAT_HR,
    ext: "PDF",
    date: "2024-03-01",
    size: "140 KB",
    source: "hr_dump_v2",
    preview: "\u0422\u0440\u0443\u0434\u043e\u0432 \u0434\u043e\u0433\u043e\u0432\u043e\u0440: \u0415\u043b\u0435\u043d\u0430 \u0412\u0430\u043b\u0435\u043d\u0442\u0438\u043d\u043e\u0432\u0430 \u0414\u0438\u043c\u0438\u0442\u0440\u043e\u0432\u0430, \u0434\u043b\u044a\u0436\u043d\u043e\u0441\u0442 \u041c\u0435\u043d\u0438\u0434\u0436\u044a\u0440 \u043e\u0431\u0441\u043b\u0443\u0436\u0432\u0430\u043d\u0435 \u043d\u0430 \u043a\u043b\u0438\u0435\u043d\u0442\u0438, \u0431\u0440\u0443\u0442\u043d\u0430 \u0437\u0430\u043f\u043b\u0430\u0442\u0430 2 800 \u043b\u0432/\u043c\u0435\u0441, \u0440\u0430\u0431\u043e\u0442\u043e\u0434\u0430\u0442\u0435\u043b: \u041c\u0435\u0434\u0438\u0430 \u0413\u0440\u0443\u043f \u0415\u041e\u041e\u0414. \u0421\u0442\u0430\u043d\u0434\u0430\u0440\u0442\u0435\u043d \u0434\u043e\u0433\u043e\u0432\u043e\u0440.",
    tags: ["\u0442\u0440\u0443\u0434\u043e\u0432 \u0434\u043e\u0433\u043e\u0432\u043e\u0440", "\u0437\u0430\u043f\u043b\u0430\u0442\u0430", "\u0441\u043b\u0443\u0436\u0438\u0442\u0435\u043b"],
  },
  {
    id: "D-008",
    name: "payslip_oct2025_kolev_d.pdf",
    category: CAT_HR,
    ext: "PDF",
    date: "2025-10-31",
    size: "38 KB",
    source: "hr_dump_v2",
    preview: "\u0424\u0438\u0448 \u0437\u0430 \u0437\u0430\u043f\u043b\u0430\u0442\u0430: \u0414\u0438\u043c\u0438\u0442\u044a\u0440 \u041a\u043e\u043b\u0435\u0432, \u043e\u043a\u0442\u043e\u043c\u0432\u0440\u0438 2025. \u0411\u0440\u0443\u0442\u043d\u043e 3 200 \u043b\u0432, \u043d\u0435\u0442\u043e 2 414 \u043b\u0432. \u0420\u0430\u0431\u043e\u0442\u043e\u0434\u0430\u0442\u0435\u043b: \u0418\u043d\u0444\u043e\u0442\u0435\u0445 \u0410\u0414. \u0411\u0435\u0437 \u043d\u0435\u0440\u0435\u0434\u043d\u043e\u0441\u0442\u0438.",
    tags: ["\u0444\u0438\u0448", "\u0437\u0430\u043f\u043b\u0430\u0442\u0430", "\u0441\u043b\u0443\u0436\u0438\u0442\u0435\u043b"],
  },
  {
    id: "D-009",
    name: "nda_zvezda_holding_mediagrup.pdf",
    category: CAT_CORP,
    ext: "PDF",
    date: "2025-07-15",
    size: "88 KB",
    source: "corp_leak_07",
    preview: "NDA \u043c\u0435\u0436\u0434\u0443 \u0417\u0432\u0435\u0437\u0434\u0430 \u0425\u043e\u043b\u0434\u0438\u043d\u0433 \u0410\u0414 \u0438 \u041c\u0435\u0434\u0438\u0430 \u0413\u0440\u0443\u043f \u0415\u041e\u041e\u0414, \u0441\u0440\u043e\u043a 3 \u0433. \u0421\u0442\u0430\u043d\u0434\u0430\u0440\u0442\u043d\u0438 \u043a\u043b\u0430\u0443\u0437\u0438 \u0437\u0430 \u043f\u043e\u0432\u0435\u0440\u0438\u0442\u0435\u043b\u043d\u043e\u0441\u0442. \u041d\u0435 \u0441\u0430 \u0432\u043a\u043b\u044e\u0447\u0435\u043d\u0438 \u0438\u043c\u0435\u043d\u0430 \u0438\u043b\u0438 \u0442\u0435\u043c\u0438 \u0441 \u043e\u0442\u043d\u043e\u0448\u0435\u043d\u0438\u0435 \u043a\u044a\u043c \u0441\u043b\u0443\u0447\u0430\u044f.",
    tags: ["NDA", "\u0434\u043e\u0433\u043e\u0432\u043e\u0440", "\u0444\u0438\u0440\u043c\u0430"],
  },
  {
    id: "D-010",
    name: "partnership_greentech_bulgaroil_2025.pdf",
    category: CAT_CORP,
    ext: "PDF",
    date: "2025-08-01",
    size: "204 KB",
    source: "corp_leak_07",
    preview: "\u041f\u0430\u0440\u0442\u043d\u044c\u043e\u0440\u0441\u043a\u0438 \u0434\u043e\u0433\u043e\u0432\u043e\u0440: GreenTech Ltd. & \u0411\u0443\u043b\u0433\u0430\u0440\u043e\u0438\u043b \u0410\u0414. \u0421\u044a\u0432\u043c\u0435\u0441\u0442\u0435\u043d \u043f\u0440\u043e\u0435\u043a\u0442 \u0437\u0430 \u0441\u043e\u043b\u0430\u0440\u043d\u0430 \u0446\u0435\u043d\u0442\u0440\u0430\u043b\u0430, \u0431\u044e\u0434\u0436\u0435\u0442 EUR 2.1 \u043c\u043b\u043d. \u0411\u0435\u0437 \u043e\u0442\u043d\u043e\u0448\u0435\u043d\u0438\u0435 \u043a\u044a\u043c \u0440\u0430\u0437\u0441\u043b\u0435\u0434\u0432\u0430\u043d\u0435\u0442\u043e.",
    tags: ["\u043f\u0430\u0440\u0442\u043d\u044c\u043e\u0440\u0441\u0442\u0432\u043e", "\u0434\u043e\u0433\u043e\u0432\u043e\u0440", "\u0444\u0438\u0440\u043c\u0430"],
  },
  {
    id: "D-011",
    name: "q3_strategy_2025_zvezda_internal.pptx",
    category: CAT_PPT,
    ext: "PPTX",
    date: "2025-09-05",
    size: "3.2 MB",
    source: "gdrive_mirror_anon",
    preview: "\u0412\u044a\u0442\u0440\u0435\u0448\u043d\u0430 \u043f\u0440\u0435\u0437\u0435\u043d\u0442\u0430\u0446\u0438\u044f \u0417\u0432\u0435\u0437\u0434\u0430 \u0425\u043e\u043b\u0434\u0438\u043d\u0433 Q3 2025: \u043f\u0430\u0437\u0430\u0440\u0435\u043d \u0443\u0434\u044f\u043b, \u043f\u0440\u043e\u0433\u043d\u043e\u0437\u0438, KPI-\u0442\u0430. 34 \u0441\u043b\u0430\u0439\u0434\u0430. \u0421\u0442\u0430\u043d\u0434\u0430\u0440\u0442\u043d\u043e \u0431\u0438\u0437\u043d\u0435\u0441 \u0441\u044a\u0434\u044a\u0440\u0436\u0430\u043d\u0438\u0435, \u0431\u0435\u0437 \u0447\u0443\u0432\u0441\u0442\u0432\u0438\u0442\u0435\u043b\u043d\u0438 \u0434\u0430\u043d\u043d\u0438 \u0437\u0430 \u0441\u043b\u0443\u0447\u0430\u044f.",
    tags: ["\u043f\u0440\u0435\u0437\u0435\u043d\u0442\u0430\u0446\u0438\u044f", "\u0431\u0438\u0437\u043d\u0435\u0441 \u0441\u0442\u0440\u0430\u0442\u0435\u0433\u0438\u044f", "\u0432\u044a\u0442\u0440\u0435\u0448\u0435\u043d"],
  },
  {
    id: "D-012",
    name: "annual_report_draft_2024_zvezda.pdf",
    category: CAT_PPT,
    ext: "PDF",
    date: "2025-09-20",
    size: "1.8 MB",
    source: "gdrive_mirror_anon",
    preview: "\u041f\u0440\u043e\u0435\u043a\u0442 \u043d\u0430 \u0433\u043e\u0434\u0438\u0448\u0435\u043d \u043e\u0442\u0447\u0435\u0442 2024 -- \u0417\u0432\u0435\u0437\u0434\u0430 \u0425\u043e\u043b\u0434\u0438\u043d\u0433. \u041f\u0440\u0438\u0445\u043e\u0434\u0438 4.7 \u043c\u043b\u043d \u043b\u0432, EBITDA 18%. \u041c\u0430\u0440\u043a\u0438\u0440\u0430\u043d DRAFT CONFIDENTIAL. \u0424\u0438\u043d\u0430\u043d\u0441\u043e\u0432\u043e \u043d\u0435\u0437\u043d\u0430\u0447\u0438\u0442\u0435\u043b\u0435\u043d \u0437\u0430 \u0441\u043b\u0443\u0447\u0430\u044f.",
    tags: ["\u043e\u0442\u0447\u0435\u0442", "\u0431\u0438\u0437\u043d\u0435\u0441", "\u0432\u044a\u0442\u0440\u0435\u0448\u0435\u043d"],
  },
  {
    id: "D-013",
    name: "icloud_photos_dump_342files.zip",
    category: CAT_IMG,
    ext: "ZIP",
    date: "2025-10-17",
    size: "412 MB",
    source: "cloud_breach_mirror",
    preview: "342 \u043b\u0438\u0447\u043d\u0438 \u0441\u043d\u0438\u043c\u043a\u0438 \u043e\u0442 iCloud \u0430\u043a\u0430\u0443\u043d\u0442: \u0432\u0430\u043a\u0430\u043d\u0446\u0438\u0438, \u0441\u0435\u043c\u0435\u0439\u043d\u0438 \u0441\u044a\u0431\u0438\u0440\u0430\u043d\u0438\u044f, \u0441\u0435\u043b\u0444\u0438\u0442\u0430. \u0411\u0435\u0437 \u043b\u043e\u043a\u0430\u0446\u0438\u043e\u043d\u043d\u0438 \u043c\u0435\u0442\u0430\u0434\u0430\u043d\u043d\u0438. \u041b\u0438\u0446\u0430\u0442\u0430 \u043d\u0435 \u0441\u0430 \u0440\u0430\u0437\u043f\u043e\u0437\u043d\u0430\u0442\u0438 \u0432 \u0440\u0430\u0437\u0441\u043b\u0435\u0434\u0432\u0430\u043d\u0435\u0442\u043e.",
    tags: ["\u0441\u043d\u0438\u043c\u043a\u0438", "iCloud", "\u043b\u0438\u0447\u043d\u0438 \u0434\u0430\u043d\u043d\u0438"],
  },
  {
    id: "D-014",
    name: "gdrive_video_family_gathering_2025.mp4",
    category: CAT_IMG,
    ext: "MP4",
    date: "2025-06-20",
    size: "87 MB",
    source: "cloud_breach_mirror",
    preview: "\u0412\u0438\u0434\u0435\u043e 3:42 \u043c\u0438\u043d \u043e\u0442 Google Drive: \u0441\u0435\u043c\u0435\u0439\u043d\u043e \u0441\u044a\u0431\u0438\u0440\u0430\u043d\u0435 \u043d\u0430 \u043e\u0442\u043a\u0440\u0438\u0442\u043e, \u043b\u0435\u0442\u0435\u043d \u0434\u0435\u043d. \u0413\u043b\u0430\u0441\u043e\u0432\u0435\u0442\u0435 \u0441\u0430 \u043d\u0435\u0440\u0430\u0437\u043f\u043e\u0437\u043d\u0430\u0432\u0430\u0435\u043c\u0438. \u0411\u0435\u0437 \u0440\u0435\u043b\u0435\u0432\u0430\u043d\u0442\u043d\u043e \u0441\u044a\u0434\u044a\u0440\u0436\u0430\u043d\u0438\u0435.",
    tags: ["\u0432\u0438\u0434\u0435\u043e", "Google Drive", "\u043b\u0438\u0447\u043d\u0438 \u0434\u0430\u043d\u043d\u0438"],
  },
  {
    id: "D-015",
    name: "police_report_pta_12092025.pdf",
    category: CAT_LAW,
    ext: "PDF",
    date: "2025-09-12",
    size: "62 KB",
    source: "anon_gov_leak",
    preview: "\u041f\u043e\u043b\u0438\u0446\u0435\u0439\u0441\u043a\u0438 \u043f\u0440\u043e\u0442\u043e\u043a\u043e\u043b \u0437\u0430 \u041f\u0422\u041f \u043e\u0442 12.09.2025, \u0431\u0443\u043b. \u0412\u0438\u0442\u043e\u0448\u0430, \u0431\u0435\u0437 \u043f\u043e\u0441\u0442\u0440\u0430\u0434\u0430\u043b\u0438 \u043b\u0438\u0446\u0430. \u0412\u0438\u043d\u043e\u0432\u0435\u043d: \u043d\u0435\u0443\u0441\u0442\u0430\u043d\u043e\u0432\u0435\u043d \u0432\u043e\u0434\u0430\u0447. \u041f\u0440\u0435\u0432\u043e\u0437\u043d\u043e\u0442\u043e \u0441\u0440\u0435\u0434\u0441\u0442\u0432\u043e \u043d\u0435 \u0441\u044a\u0432\u043f\u0430\u0434\u0430 \u0441 \u043d\u0438\u0442\u043e \u0435\u0434\u043d\u043e \u0432 \u0441\u043b\u0443\u0447\u0430\u044f.",
    tags: ["\u043f\u043e\u043b\u0438\u0446\u0438\u044f", "\u041f\u0422\u041f", "\u043f\u0440\u043e\u0442\u043e\u043a\u043e\u043b"],
  },
  {
    id: "D-016",
    name: "court_decision_property_dispute_sofia.pdf",
    category: CAT_LAW,
    ext: "PDF",
    date: "2025-08-28",
    size: "110 KB",
    source: "anon_gov_leak",
    preview: "\u0420\u0435\u0448\u0435\u043d\u0438\u0435 \u043d\u0430 \u0421\u0420\u0421 \u043f\u043e \u0433\u0440\u0430\u0436\u0434\u0430\u043d\u0441\u043a\u043e \u0434\u0435\u043b\u043e \u0437\u0430 \u0438\u043c\u0443\u0449\u0435\u0441\u0442\u0432\u0435\u043d \u0441\u043f\u043e\u0440 -- \u043f\u0440\u0438\u043a\u043b\u044e\u0447\u0435\u043d\u043e \u0432 \u043f\u043e\u043b\u0437\u0430 \u043d\u0430 \u0438\u0449\u0435\u0446\u0430. \u0421\u0442\u0440\u0430\u043d\u0438\u0442\u0435 \u043f\u043e \u0434\u0435\u043b\u043e\u0442\u043e \u043d\u044f\u043c\u0430\u0442 \u043e\u0442\u043d\u043e\u0448\u0435\u043d\u0438\u0435 \u043a\u044a\u043c \u0441\u043b\u0443\u0447\u0430\u044f.",
    tags: ["\u0441\u044a\u0434", "\u0440\u0435\u0448\u0435\u043d\u0438\u0435", "\u0438\u043c\u0443\u0449\u0435\u0441\u0442\u0432\u043e"],
  },
  {
    id: "D-017",
    name: "notary_deed_lozentez_apt_2024.pdf",
    category: CAT_PROP,
    ext: "PDF",
    date: "2024-11-10",
    size: "156 KB",
    source: "registry_leak_bg",
    preview: "\u041d\u043e\u0442\u0430\u0440\u0438\u0430\u043b\u0435\u043d \u0430\u043a\u0442 \u2116 114/2024: \u0430\u043f\u0430\u0440\u0442\u0430\u043c\u0435\u043d\u0442 78 \u043a\u0432.m, \u043a\u0432. \u041b\u043e\u0437\u0435\u043d\u0435\u0446, \u043f\u0440\u043e\u0434\u0430\u0432\u0430\u0447 \u0421\u0442\u0430\u043c\u043e \u041d\u0438\u043a\u043e\u043b\u043e\u0432, \u043a\u0443\u043f\u0443\u0432\u0430\u0447 \u041a\u0440\u0430\u0441\u0438\u043c\u0438\u0440\u0430 \u041f\u0435\u0442\u0440\u043e\u0432\u0430, \u0446\u0435\u043d\u0430 EUR 142 000. \u0421\u0442\u0430\u043d\u0434\u0430\u0440\u0442\u043d\u0430 \u0441\u0434\u0435\u043b\u043a\u0430.",
    tags: ["\u043d\u043e\u0442\u0430\u0440\u0438\u0430\u043b\u0435\u043d \u0430\u043a\u0442", "\u0430\u043f\u0430\u0440\u0442\u0430\u043c\u0435\u043d\u0442", "\u0438\u043c\u043e\u0442"],
  },
  {
    id: "D-018",
    name: "property_docs_villa_varna_2023.pdf",
    category: CAT_PROP,
    ext: "PDF",
    date: "2023-07-22",
    size: "198 KB",
    source: "registry_leak_bg",
    preview: "\u0414\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u0438 \u0437\u0430 \u0432\u0438\u043b\u0430, \u043c-\u0441\u0442 \u0422\u0440\u0430\u043a\u0430\u0442\u0430, \u0412\u0430\u0440\u043d\u0430, 2023. \u0421\u043e\u0431\u0441\u0442\u0432\u0435\u043d\u0438\u043a: \u041b\u044e\u0434\u043c\u0438\u043b\u0430 \u0422\u043e\u0434\u043e\u0440\u043e\u0432\u0430-\u041c\u0430\u043d\u0435\u0432\u0430. \u0418\u043f\u043e\u0442\u0435\u043a\u0430 \u043a\u044a\u043c \u042e\u043d\u0438\u041a\u0440\u0435\u0434\u0438\u0442 \u0411\u0443\u043b\u0431\u0430\u043d\u043a. \u0411\u0435\u0437 \u043e\u0442\u043d\u043e\u0448\u0435\u043d\u0438\u0435 \u043a\u044a\u043c \u0441\u043b\u0443\u0447\u0430\u044f.",
    tags: ["\u0432\u0438\u043b\u0430", "\u0438\u043c\u043e\u0442", "\u0412\u0430\u0440\u043d\u0430"],
  },
]

const CATEGORY_ICONS: Record<DocCategory, string> = {
  [CAT_ID]:   "ID",
  [CAT_DL]:   "DL",
  [CAT_TAX]:  "TX",
  [CAT_HR]:   "HR",
  [CAT_CORP]: "NDA",
  [CAT_PPT]:  "PPT",
  [CAT_IMG]:  "IMG",
  [CAT_LAW]:  "LAW",
  [CAT_PROP]: "REG",
}

const EXT_COLOR: Record<string, string> = {
  JPG:  "#4488FF",
  PDF:  "#FF4444",
  XLSX: "#44CC44",
  PPTX: "#FF8800",
  ZIP:  "#AAAAAA",
  MP4:  "#AA44FF",
}

const CATEGORIES = Array.from(new Set(DOCS.map((d) => d.category))) as DocCategory[]

export default function LeaksDocsPage() {
  const [savedClues, setSavedClues] = useState<string[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<DocCategory | null>(null)

  useEffect(() => {
    setSavedClues(getGameState().clues.map((c) => c.id))
  }, [])

  const handleSave = (doc: Doc) => {
    const id = `leaks-docs-noise-${doc.id}`
    if (savedClues.includes(id)) return
    const gs = getGameState()
    const updated = addClue(gs, {
      id,
      title: `[DOCS] ${doc.name}`,
      text: doc.preview,
      sourceRoute: "/leaks/docs",
      confidence: 1,
      status: "unverified",
    })
    saveGameState(updated)
    setSavedClues((p) => [...p, id])
  }

  const filtered = categoryFilter ? DOCS.filter((d) => d.category === categoryFilter) : DOCS

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>

      <div style={{ marginBottom: 20 }}>
        <Link
          href="/hidden-wiki-2/leaks"
          style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#909090", letterSpacing: "0.15em", textDecoration: "none" }}
        >
          {"<- LEAKS"}
        </Link>
        <div style={{ marginTop: 10 }}>
          <GlitchText text="DOCS" as="h1" intensity="low" className="text-3xl font-bold tracking-widest" color={ACCENT} />
        </div>
        <div style={{ height: 1, background: `linear-gradient(90deg, ${ACCENT}, transparent)`, marginTop: 8, opacity: 0.5 }} />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 18 }}>
        <button
          onClick={() => setCategoryFilter(null)}
          style={{
            padding: "3px 12px", fontSize: 9, fontFamily: "var(--font-mono)", letterSpacing: "0.08em",
            background: !categoryFilter ? `${ACCENT}20` : "#0a0a0a",
            color: !categoryFilter ? ACCENT : "#666",
            border: `1px solid ${!categoryFilter ? ACCENT + "40" : "#1a1a1a"}`,
            cursor: "pointer",
          }}>
          {"\u0412\u0421\u0418\u0427\u041a\u0418"}
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(categoryFilter === cat ? null : cat)}
            style={{
              padding: "3px 10px", fontSize: 9, fontFamily: "var(--font-mono)",
              background: categoryFilter === cat ? `${ACCENT}15` : "#090909",
              color: categoryFilter === cat ? ACCENT : "#666",
              border: `1px solid ${categoryFilter === cat ? ACCENT + "30" : "#161616"}`,
              cursor: "pointer", letterSpacing: "0.05em",
            }}>
            [{CATEGORY_ICONS[cat]}] {cat}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {filtered.map((doc) => {
          const isExpanded = expanded === doc.id
          const isSaved = savedClues.includes(`leaks-docs-noise-${doc.id}`)
          const extColor = EXT_COLOR[doc.ext] ?? "#888"

          return (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              style={{ background: "#090909", border: "1px solid #141414" }}
            >
              <div
                onClick={() => setExpanded(isExpanded ? null : doc.id)}
                style={{ padding: "10px 16px", display: "flex", alignItems: "flex-start", gap: 14, cursor: "pointer" }}
              >
                <div style={{
                  flexShrink: 0, width: 38, height: 38,
                  background: `${extColor}12`, border: `1px solid ${extColor}30`,
                  display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2,
                }}>
                  <span style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: extColor, letterSpacing: "0.05em" }}>{doc.ext}</span>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#444", letterSpacing: "0.12em" }}>{doc.id}</span>
                    <span style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#333", background: "#111", padding: "1px 6px", border: "1px solid #1e1e1e", letterSpacing: "0.05em" }}>
                      [{CATEGORY_ICONS[doc.category]}] {doc.category}
                    </span>
                    <span style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#404040" }}>{doc.date} -- {doc.size}</span>
                  </div>
                  <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "#cccccc", letterSpacing: "0.03em", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {doc.name}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center" }}>
                    <span style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#404040" }}>
                      src: <span style={{ color: "#555" }}>{doc.source}</span>
                    </span>
                    {doc.tags.map((t) => (
                      <span key={t} style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#383838", padding: "0 4px", border: "1px solid #1c1c1c" }}>#{t}</span>
                    ))}
                  </div>
                </div>

                <span style={{ fontSize: 9, color: "#333", fontFamily: "var(--font-mono)", flexShrink: 0, marginTop: 2 }}>
                  {isExpanded ? "[^]" : "[v]"}
                </span>
              </div>

              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  style={{ borderTop: "1px solid #141414", padding: "12px 16px" }}
                >
                  <p style={{ fontSize: 11, color: "#b0b0b0", margin: "0 0 12px", fontFamily: "var(--font-mono)", lineHeight: 1.8 }}>
                    {doc.preview}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSave(doc) }}
                      style={{
                        padding: "4px 14px", fontSize: 9, fontFamily: "var(--font-mono)", letterSpacing: "0.1em",
                        background: isSaved ? `${ACCENT}14` : "#0f0f0f",
                        color: isSaved ? ACCENT : "#666",
                        border: `1px solid ${isSaved ? ACCENT + "40" : "#202020"}`,
                        cursor: isSaved ? "default" : "pointer", transition: "all 0.2s",
                      }}>
                      {isSaved ? "\u0417\u0410\u041f\u0410\u0417\u0415\u041d\u041e" : "\u0417\u0410\u041f\u0410\u0417\u0418 \u0421\u041b\u0415\u0414\u0410"}
                    </button>
                    {isSaved && (
                      <span style={{ fontSize: 8, fontFamily: "var(--font-mono)", color: "#444", letterSpacing: "0.1em" }}>
                        {"\u0434\u043e\u0441\u0442\u043e\u0432\u0435\u0440\u043d\u043e\u0441\u0442: \u043d\u0438\u0441\u043a\u0430 -- \u0441\u0442\u0430\u0442\u0443\u0441: \u043d\u0435\u043f\u043e\u0442\u0432\u044a\u0440\u0434\u0435\u043d\u043e"}
                      </span>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>

      <div style={{ marginTop: 20, paddingTop: 10, borderTop: "1px solid #111", fontSize: 9, fontFamily: "var(--font-mono)", color: "#333", letterSpacing: "0.1em" }}>
        {"\u041f\u041e\u041a\u0410\u0417\u0410\u041d\u0418"} {filtered.length} / {DOCS.length} {"\u0414\u041e\u041a\u0423\u041c\u0415\u041d\u0422\u0410"}
      </div>
    </div>
  )
}
