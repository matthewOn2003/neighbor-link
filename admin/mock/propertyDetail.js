const propertyDetails = {
  "1": {
    id: "1",
    propertyCode: "PROP-MY-8821",
    propertyName: "Aurora Heights",
    unitNumber: "A-12-03",
    title: "Aurora Heights — Unit A-12-03",
    address: "Jalan Kiara 3, Mont Kiara, 50480 Kuala Lumpur, Wilayah Persekutuan",
    propertyType: "Condominium",
    telemetryStatus: "Telemetry Active",
    occupancyStatus: "Occupied",
    image: "/stitch/property-interior.jpg",
    imageLabel: "Unit Gallery",
    imageTitle: "Interior & Living Space",
    galleryCount: 14,
    monthlyRent: "1,800",
    rentNote: "Fixed lease till Dec 2026",
    currentOutstanding: "0.00",
    outstandingLabel: "Fully Paid",
    totalPaidYtd: "18,000",
    totalPaidProgressLabel: "10/12",
    totalPaidProgressWidth: "83%",
    nextDueDate: "Nov 01, 2026",
    nextDueLabel: "Bill #INV-1090 scheduled",
    unitMetaBadge: "Type B2 • High Floor",
    specs: [
      {
        label: "Unit Number",
        value: "A-12-03",
        subtext: "Tower A • Level 12",
      },
      {
        label: "Floor Size",
        value: "950",
        suffix: "sq.ft",
        subtext: "88.2 sq. meters",
      },
      {
        label: "Bed & Bath",
        value: "2 Bed • 2 Bath",
        subtext: "Ensuite Master",
      },
      {
        label: "Furnishing",
        value: "Fully Furnished",
        subtext: "Designer Fitted",
      },
    ],
    parkingLabel: "Lot #P2-44 (Basement 2, Pillar E)",
    amenities: [
      {
        icon: "ac_unit",
        title: "3x Aircon",
        detail: "Daikin Inverter",
      },
      {
        icon: "lock",
        title: "Smart Lock",
        detail: "Samsung Digital",
      },
      {
        icon: "local_laundry_service",
        title: "Washer-Dryer",
        detail: "LG 2-in-1 10kg",
      },
      {
        icon: "balcony",
        title: "Private Balcony",
        detail: "Mont Kiara Skyline",
      },
    ],
    tenant: {
      name: "John Tan",
      avatar: "/stitch/tenant-john-tan.jpg",
      phone: "+60 12-345 6789",
      email: "john.tan@example.com",
      badge: "Primary Tenant",
    },
    contract: {
      leaseDuration: "Jan 01, 2026 – Dec 31, 2026",
      leaseMeta: "12 Months (2 months remaining)",
      deposit: "3,600",
      depositLabel: "In Escrow Account",
      progressLabel: "Tenancy Progress (Month 10 of 12)",
      progressValue: "83.3% elapsed",
      progressWidth: "83.3%",
      moveIn: "Move-in: Jan 01, 2026",
      renewalNotice: "Renewal notice window opens Nov 15",
      expiry: "Expiry: Dec 31, 2026",
    },
    bills: [
      {
        invoiceId: "INV-1089",
        period: "Oct 2026 Rent",
        dueDate: "Oct 01, 2026",
        amount: "1,800.00",
        status: "Paid Oct 02",
        receiptId: "RCP-8921",
      },
      {
        invoiceId: "INV-1074",
        period: "Sep 2026 Rent",
        dueDate: "Sep 01, 2026",
        amount: "1,800.00",
        status: "Paid Sep 01",
        receiptId: "RCP-8710",
      },
      {
        invoiceId: "INV-1061",
        period: "Aug 2026 Rent",
        dueDate: "Aug 01, 2026",
        amount: "1,800.00",
        status: "Paid Aug 01",
        receiptId: "RCP-8544",
      },
    ],
    wifi: {
      networkName: "Aurora_A12_5G",
      password: "Aur0ra#Secur3!99",
      maskedPassword: "•••••••••••••",
      routerHardware: "TP-Link Archer AX55",
      bandwidthTier: "500 Mbps Fiber",
      status: "Active",
    },
    complaints: [
      {
        id: "TKT-2026-088",
        status: "Resolved",
        title: "Bathroom faucet leak",
        description:
          "Fixed by Master Plumber Lee on Sep 12, 2026. Cartridge replaced under warranty.",
        reporter: "Reported by: John Tan",
        turnaround: "Turnaround: 4h 15m",
      },
    ],
    access: {
      smartLockPin: "* 7 9 2 4 #",
      pinCopyValue: "7924",
      pinNotice: "Auto-expires upon tenant check-out (Dec 31, 2026)",
      handoverItems: [
        {
          icon: "credit_card",
          label: "Access Cards",
          value: "2x Cards Issued (#AC-091, #AC-092)",
        },
        {
          icon: "key",
          label: "Mailbox Key",
          value: "1x Brass Key (#MB-1203)",
        },
        {
          icon: "directions_car",
          label: "Boomgate RFID",
          value: "1x Car Tag (#TG-5501)",
        },
      ],
      operatorNote:
        "AC servicing due in November. Management office requires 24h prior notification before contractor entry.",
    },
  },
};

export { propertyDetails };

export function getPropertyDetail(id) {
  const propertyId = Array.isArray(id) ? id[0] : String(id || "1");
  const detail = propertyDetails[propertyId];

  if (detail) {
    return detail;
  }

  const base = propertyDetails["1"];
  const numericId = propertyId.replace(/\D/g, "") || "1";
  const paddedId = numericId.padStart(4, "0").slice(-4);
  const fallbackUnit = `A-12-${numericId.padStart(2, "0").slice(-2)}`;

  return {
    ...base,
    id: propertyId,
    propertyCode: `PROP-MY-${paddedId}`,
    unitNumber: fallbackUnit,
    title: `${base.propertyName} — Unit ${fallbackUnit}`,
    specs: base.specs.map((spec) =>
      spec.label === "Unit Number" ? { ...spec, value: fallbackUnit } : spec,
    ),
  };
}
