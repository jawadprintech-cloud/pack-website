// Packaging Toolkit pages: the directory (/tools/) and each tool (/tools/<slug>/).
import t_barcode_generator from "./barcode-generator";
import t_box_volume_calculator from "./box-volume-calculator";
import t_dimensional_weight_calculator from "./dimensional-weight-calculator";
import t_mylar_bag_size_finder from "./mylar-bag-size-finder";
import t_oxygen_absorber_calculator from "./oxygen-absorber-calculator";
import t_pallet_calculator from "./pallet-calculator";
import t_paper_weight_converter from "./paper-weight-converter";
import t_qr_code_generator from "./qr-code-generator";
import t_standard_box_sizes from "./standard-box-sizes";

export const toolkitPages: Record<string, { title: string; description: string; html: string }> = {
  "barcode-generator": { title: "Barcode Generator | Pack Legacy", description: "Prepare a barcode for your product label at the right print size.", html: t_barcode_generator },
  "box-volume-calculator": { title: "Box Volume & CBM Calculator | Pack Legacy", description: "Calculate carton volume and the cubic meters your order occupies.", html: t_box_volume_calculator },
  "dimensional-weight-calculator": { title: "Dimensional Weight Calculator | Pack Legacy", description: "Estimate billable weight across UPS, FedEx, USPS and DHL Express using your package dimensions and actual weight.", html: t_dimensional_weight_calculator },
  "mylar-bag-size-finder": { title: "Mylar Bag Size Finder | Pack Legacy", description: "Find a bag size for your product, fill weight, and sealing headspace.", html: t_mylar_bag_size_finder },
  "oxygen-absorber-calculator": { title: "Oxygen Absorber Calculator | Pack Legacy", description: "Estimate the oxygen absorber capacity for your storage container.", html: t_oxygen_absorber_calculator },
  "pallet-calculator": { title: "Pallet & Container Load Calculator | Pack Legacy", description: "Plan how many cartons fit on a pallet or inside a shipping container.", html: t_pallet_calculator },
  "paper-weight-converter": { title: "Paper Weight Converter | Pack Legacy", description: "Convert board weights between common paper measurement systems.", html: t_paper_weight_converter },
  "qr-code-generator": { title: "QR Code Generator for Packaging | Pack Legacy", description: "Create a scannable QR code for your printed packaging.", html: t_qr_code_generator },
  "standard-box-sizes": { title: "Standard Box Sizes & Box Finder | Pack Legacy", description: "Find a standard carton that fits your product and compare shipping options.", html: t_standard_box_sizes },
};
