// Business-owned source. Do not activate prices until the owner approves the tariff.
export default {
  brand: "DIGITAL EXPRESS",
  apiEndpoint: "",
  branches: {
    Chacarilla: "51968241599",
    "Monte Grande": "51968229804",
    Chorrillos: "51962292116"
  },
  photoSizes: ["10 x 15 cm", "13 x 18 cm", "15 x 21 cm", "20 x 30 cm", "30 x 40 cm"],
  tariff: {
    approved: false,
    version: "",
    approvedBy: "",
    source: "",
    validFrom: "",
    validUntil: "",
    // One row per product, size, finish, branch and quantity band.
    // minQuantity/maxQuantity are inclusive; null maximum means no upper limit.
    // unitPriceCents is the final price PER UNIT for the entire selected band.
    // Do not apply the old website's percentage discounts on top of these rates.
    rows: []
  }
};
