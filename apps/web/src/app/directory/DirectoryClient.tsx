'use client'

import { useState } from "react";
import { motion } from "framer-motion";

import { SearchIcon } from "@/components/icons/ZenIcons";

interface Center {
  name: string;
  address: string;
  phone: string;
  hours: string;
}

interface Region {
  id: string;
  name: string;
  centers: Center[];
}

const regions: Region[] = [
  {
    id: "us", name: "Hoa Kỳ", centers: [
      { name: "Quán Âm Đường New York", address: "142-09 Cherry Ave, Flushing, NY 11355", phone: "+1 718-888-6326", hours: "T2-CN: 10:00 - 17:00" },
      { name: "Quán Âm Đường San Francisco", address: "645 Monterey Blvd, San Francisco, CA 94127", phone: "+1 415-682-0888", hours: "T3-CN: 10:00 - 17:00" },
      { name: "Quán Âm Đường Los Angeles", address: "838 E Las Tunas Dr, San Gabriel, CA 91776", phone: "+1 626-872-0488", hours: "T2-CN: 10:00 - 17:00" },
      { name: "Quán Âm Đường Houston", address: "9968 Bellaire Blvd #B, Houston, TX 77036", phone: "+1 832-430-8686", hours: "T2-CN: 10:00 - 16:00" },
    ]
  },
  {
    id: "eu", name: "Châu Âu", centers: [
      { name: "Quán Âm Đường Paris", address: "56 Avenue d'Ivry, 75013 Paris, France", phone: "+33 1 45 86 40 88", hours: "T2-T7: 10:00 - 17:00" },
      { name: "Quán Âm Đường London", address: "171 Uxbridge Rd, Shepherd's Bush, London W12 9RA", phone: "+44 20 8222 7966", hours: "T2-CN: 10:00 - 17:00" },
    ]
  },
  {
    id: "asia", name: "Châu Á", centers: [
      { name: "Quán Âm Đường Singapore", address: "156 Tyrwhitt Rd, Singapore 207568", phone: "+65 6222 2603", hours: "T2-CN: 10:00 - 18:00" },
      { name: "Quán Âm Đường Kuala Lumpur", address: "13, Jalan 14/105C, Taman Midah, 56000 KL", phone: "+60 3-9171 2272", hours: "T2-T7: 10:00 - 17:00" },
      { name: "Quán Âm Đường Tokyo", address: "1-2-3 Shinjuku, Shinjuku-ku, Tokyo 160-0022", phone: "+81 3-5367-1717", hours: "T3-CN: 10:00 - 17:00" },
    ]
  },
  {
    id: "au", name: "Châu Úc", centers: [
      { name: "Quán Âm Đường Sydney (Trụ Sở Chính)", address: "2A Holden Street, Ashfield NSW 2131, Australia", phone: "+61 2 9283 2758", hours: "T2-CN: 10:00 - 17:00" },
      { name: "Quán Âm Đường Melbourne", address: "1-5 Anderson Rd, Thornbury VIC 3071", phone: "+61 3 9480 5188", hours: "T2-T7: 10:00 - 17:00" },
    ]
  },
];

export default function DirectoryClient() {
  const [search, setSearch] = useState("");
  const [activeRegion, setActiveRegion] = useState<string | null>(null);

  const filteredRegions = regions
    .filter((region) => !activeRegion || region.id === activeRegion)
    .map((region) => ({
      ...region,
      centers: region.centers.filter((center) => !search || center.name.toLowerCase().includes(search.toLowerCase()) || center.address.toLowerCase().includes(search.toLowerCase())),
    }))
    .filter((region) => region.centers.length > 0);

  return (
    <main className="route-shell">
      <div className="route-frame">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="route-hero">
          <p className="route-kicker mb-3">Toàn Cầu</p>
          <h1 className="route-title mb-4 md:text-5xl">Quán Âm Đường Toàn Cầu</h1>
          <p className="route-copy mx-auto">Tìm Quán Âm Đường gần bạn nhất — 30+ quốc gia trên toàn thế giới.</p>
        </motion.div>

        <div className="mb-6 flex flex-wrap justify-center gap-2">
          <button onClick={() => setActiveRegion(null)} className={`filter-chip ${!activeRegion ? "filter-chip-active" : "filter-chip-idle"}`}>Tất cả</button>
          {regions.map((region) => (
            <button key={region.id} onClick={() => setActiveRegion(activeRegion === region.id ? null : region.id)} className={`filter-chip ${activeRegion === region.id ? "filter-chip-active" : "filter-chip-idle"}`}>{region.name}</button>
          ))}
        </div>

        <div className="relative mx-auto mb-10 max-w-lg">
          <SearchIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo tên hoặc địa chỉ..." className="toolbar-search py-3 pl-12 pr-4" />
        </div>

        <div className="space-y-10">
          {filteredRegions.map((region) => (
            <div key={region.id}>
              <h2 className="ant-title mb-4 text-2xl text-foreground">{region.name}</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {region.centers.map((center) => (
                  <div key={center.name} className="panel-shell panel-hover p-5">
                    <h3 className="mb-2 text-base font-semibold text-foreground">{center.name}</h3>
                    <a href={`https://maps.google.com/?q=${encodeURIComponent(center.address)}`} target="_blank" rel="noopener noreferrer" className="mb-1 block text-xs text-muted-foreground transition-colors hover:text-foreground">{center.address}</a>
                    <a href={`tel:${center.phone}`} className="text-xs text-gold-dim">{center.phone}</a>
                    <p className="mt-1 text-xs text-muted-foreground">{center.hours}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
