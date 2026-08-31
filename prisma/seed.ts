import { PrismaClient } from "@/src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
    adapter,
});

async function main() {
    const password = await bcrypt.hash("admin123", 10);

    const admin = await prisma.user.upsert({
        where: {
            username: "admin",
        },
        update: {},
        create: {
            username: "admin",
            password,
            name: "Administrator",
            role: "ADMIN",
            is_active: true,
        },
    });

    // await prisma.customer.createMany({
    //     data: [
    //         {
    //             // id: 1,
    //             name: "RSUD Kota Kendari",
    //         },
    //     ],
    //     skipDuplicates: true,
    // });

    // await prisma.product.createMany({
    //     data: [
    //         {
    //             product_name: "Acid Storage",
    //             product_type: "BLPK-204",
    //         },
    //         {
    //             product_name: "Ambulance Stretcher Standard",
    //             product_type: "BAS-301-S",
    //         },
    //         {
    //             product_name: "Ambulance Strecher",
    //             product_type: "BAS-301",
    //         },
    //         {
    //             product_name: "Air Scanner Pro",
    //             product_type: "Pro",
    //         },
    //         {
    //             product_name: "bipMED Anaesthesia Machine",
    //             product_type: "BAM-301-852",
    //         },
    //         {
    //             product_name: "Autopsy Table",
    //             product_type: "BMO-201-AT",
    //         },
    //         {
    //             product_name: "Aseptic Dispensing",
    //             product_type: "BLA-201-AD",
    //         },
    //         {
    //             product_name: "Autoclave 100 L",
    //             product_type: "HV",
    //         },
    //         {
    //             product_name: "bipMED Automatic Pulsewave Blood Pressure Monitor",
    //             product_type: "BTM-301-02",
    //         },
    //         {
    //             product_name: "Bilik Isolation Chamber",
    //             product_type: "BAS-702-IS",
    //         },
    //         {
    //             product_name: "Baby Box S/S",
    //             product_type: "BBB-201",
    //         },
    //         {
    //             product_name: "Baby Box P/C",
    //             product_type: "BBB-101",
    //         },
    //         {
    //             product_name: "Baby Cot",
    //             product_type: "BBC-101",
    //         },
    //         {
    //             product_name: "Baby Cot",
    //             product_type: "BBC-201",
    //         },
    //         {
    //             product_name: "Basket Stretcher",
    //             product_type: "BAS-301-BS",
    //         },
    //         {
    //             product_name: "Baby Measurement Alumunium",
    //             product_type: "BBT-302-A",
    //         },
    //         {
    //             product_name: "Bed Pasien",
    //             product_type: "BHB-101-RHB",
    //         },
    //         {
    //             product_name: "Bed Transfer Patient",
    //             product_type: "BBP-111-BTP",
    //         },
    //         {
    //             product_name: "Bed Screen Single P/C",
    //             product_type: "BSS - 101 - S",
    //         },
    //         {
    //             product_name: "Bed Screen Triple P/C",
    //             product_type: "BSS - 103 - T",
    //         },
    //         {
    //             product_name: "Bed Screen Single S/S",
    //             product_type: "BSS - 201 - S",
    //         },
    //         {
    //             product_name: "Bed Screen Double P/C",
    //             product_type: "BSS - 102 - D",
    //         },
    //         {
    //             product_name: "Bed Screen Double S/S",
    //             product_type: "BSS - 202 - D",
    //         },
    //         {
    //             product_name: "Bed Screen Triple S/S",
    //             product_type: "BSS-203-T",
    //         },
    //         {
    //             product_name: "Bachitheraphi C-ARM Table",
    //             product_type: "BOTC-101-ARM",
    //         },
    //         {
    //             product_name: "Brachytherapy Table C-ARM",
    //             product_type: "BOTC - 102 - ARM",
    //         },
    //         {
    //             product_name: "Bachitheraphi C-ARM Table",
    //             product_type: "BOTC-201-ARM",
    //         },
    //         {
    //             product_name: "Bed Side Cabinet ABS",
    //             product_type: "BSC - 101 - A",
    //         },
    //         {
    //             product_name: "Bed Side Cabinet",
    //             product_type: "BSC-101-SD",
    //         },
    //         {
    //             product_name: "Bed Side Cabinet ABS",
    //             product_type: "BSC - 101 - B",
    //         },
    //         {
    //             product_name: "Bed Side Cabinet",
    //             product_type: "BSC - 101",
    //         },
    //         {
    //             product_name: "Bedside Cabinet Food Tray",
    //             product_type: "BSC - 102 - FT",
    //         },
    //         {
    //             product_name: "Bed Side Cabinet",
    //             product_type: "BSC - 204 - C",
    //         },
    //         {
    //             product_name: "Blue Light Phototherapy",
    //             product_type: "BPT-301-5L",
    //         },
    //         {
    //             product_name: "Blue Light Phototherapy",
    //             product_type: "BPT-301-6L",
    //         },
    //         {
    //             product_name: "Biosafety Cabinet",
    //             product_type: "BSF - 101",
    //         },
    //         {
    //             product_name: "Biosafety Cabinet",
    //             product_type: "BSF - 102 - BSC",
    //         },
    //         {
    //             product_name: "Biosafety Cabinet",
    //             product_type: "BSC-120",
    //         },
    //         {
    //             product_name: "Biosafety Cabinet",
    //             product_type: "BSF-103-BSC",
    //         },
    //         {
    //             product_name: "Biosafety Cabinet",
    //             product_type: "BSF-101-C",
    //         },
    //         {
    //             product_name: "Biosafety Cabinet",
    //             product_type: "BSF-104-BSC",
    //         },
    //         {
    //             product_name: "Biosafety Cabinet",
    //             product_type: "01SFB-1C",
    //         },
    //         {
    //             product_name: "Biosafety Cabinet",
    //             product_type: "01SFB-4PCR",
    //         },
    //         {
    //             product_name: "Biosafety Cabinet",
    //             product_type: "BSM KLS 1",
    //         },
    //         {
    //             product_name: "Biosafety Cabinet",
    //             product_type: "Service / Custom",
    //         },
    //         {
    //             product_name: "Block Storage Cabinet (1 Kaki, 1 Tutup, 5 Rack)",
    //             product_type: "BBBC-102-5C",
    //         },
    //         {
    //             product_name: "Block Cabinet (Uk. 68 x 78 x 81 cm)",
    //             product_type: "Custom",
    //         },
    //         {
    //             product_name: "Blood Bank Refrigerator",
    //             product_type: "BBLO-102-BB",
    //         },
    //         {
    //             product_name: "KULKAS REAGEN",
    //             product_type: "BBLO-102-RG",
    //         },
    //         {
    //             product_name: "Blood Bank Refrigerator",
    //             product_type: "-",
    //         },
    //         {
    //             product_name: "Blood Bank Refrigerator Single",
    //             product_type: "BBLO-101-BB",
    //         },
    //         {
    //             product_name: "Blood Bank Refrigerator",
    //             product_type: "BBLO-102-45L",
    //         },
    //         {
    //             product_name: "Blood Bank Refrigerator",
    //             product_type: "BBLO-102-85L",
    //         },
    //         {
    //             product_name: "Blood Bank Refrigerator",
    //             product_type: "DRF-101-BB",
    //         },
    //         {
    //             product_name: "Blood Roller Mixer",
    //             product_type: "BRM-301-01",
    //         },
    //         {
    //             product_name: "Brancart Complete",
    //             product_type: "BBP-203-C",
    //         },
    //         {
    //             product_name: "Brancart Multipurse",
    //             product_type: "BAS-303-M",
    //         },
    //         {
    //             product_name: "Brancart Patient P/C",
    //             product_type: "BBP-101",
    //         },
    //         {
    //             product_name: "Brancart Patient",
    //             product_type: "BBP-201",
    //         },
    //         {
    //             product_name: "Brancart High - Low",
    //             product_type: "BBP-104-HL",
    //         },
    //         {
    //             product_name: "Brancart Complete High-Deluxe",
    //             product_type: "BBP-111-DA",
    //         },
    //         {
    //             product_name: "EmergencyBed/Brancart Complete ABS",
    //             product_type: "BBP-111-DA/Custom",
    //         },
    //         {
    //             product_name: "bipMED Bubble CPAP",
    //             product_type: "BCPAP-301-180",
    //         },
    //         {
    //             product_name: "Centrifuge 12 & 24 Hole (2 Rotor)",
    //             product_type: "BCF-301-01",
    //         },
    //         {
    //             product_name: "Chemical Storage Cabinets",
    //             product_type: "BCS-101-C",
    //         },
    //         {
    //             product_name: "Chemical Storage",
    //             product_type: "BLPK-203",
    //         },
    //         {
    //             product_name: "Children Hospital Bed",
    //             product_type: "BHC-101",
    //         },
    //         {
    //             product_name: "Children Hospital Bed Crank",
    //             product_type: "BHC-201-1C",
    //         },
    //         {
    //             product_name: "CPM Trolley",
    //             product_type: "BCPM-101-T",
    //         },
    //         {
    //             product_name: "bipMED Dental Unit",
    //             product_type: "BDU-102-E",
    //         },
    //         {
    //             product_name: "bipMED Dental Unit",
    //             product_type: "BDU-102-E (Premium)",
    //         },
    //         {
    //             product_name: "bipMED Digital Orbital Shaker",
    //             product_type: "BOS-301-01",
    //         },
    //         {
    //             product_name: "Derssing Trolley P/C",
    //             product_type: "BDT - 101",
    //         },
    //         {
    //             product_name: "Dressing Trolley S/S",
    //             product_type: "BDT-201",
    //         },
    //         {
    //             product_name: "ECG 3 Chanel",
    //             product_type: "BECG-302-3C",
    //         },
    //         {
    //             product_name: "ECG 12 Chanel",
    //             product_type: "BECG-302-12C",
    //         },
    //         {
    //             product_name: "bipMED Emergency & Transport Ventilator",
    //             product_type: "BTV-301-200",
    //         },
    //         {
    //             product_name: "bipMED Emergency & Transport Ventilator",
    //             product_type: "BTV-301-230",
    //         },
    //         {
    //             product_name: "bipMED Ventilator",
    //             product_type: "BTV-301-320",
    //         },
    //         {
    //             product_name: "Emergency Bed",
    //             product_type: "Custom",
    //         },
    //         {
    //             product_name: "Emergency Shower & Eyewash",
    //             product_type: "Custom",
    //         },
    //         {
    //             product_name: "Emergency Shower with Eye Washer",
    //             product_type: "BEW-201-S",
    //         },
    //         {
    //             product_name: "Eye Wash Portable",
    //             product_type: "BEW-201",
    //         },
    //         {
    //             product_name: "Emergency Trolley",
    //             product_type: "Custom",
    //         },
    //         {
    //             product_name: "Emergency Trolley P/C",
    //             product_type: "BETR-101",
    //         },
    //         {
    //             product_name: "Emergency Trolley S/S",
    //             product_type: "BETR-201",
    //         },
    //         {
    //             product_name: "Emergency Trolley",
    //             product_type: "BETR-301-DLX",
    //         },
    //         {
    //             product_name: "Evac Chair",
    //             product_type: "Custom",
    //         },
    //         {
    //             product_name: "Evac Chair",
    //             product_type: "BEC-101-F",
    //         },
    //         {
    //             product_name: "Examination Lamp LED",
    //             product_type: "Custom",
    //         },
    //         {
    //             product_name: "Examination Lamp LED",
    //             product_type: "BEL-102-LED",
    //         },
    //         {
    //             product_name: "Examine Lamp Halogen",
    //             product_type: "BEL-102-H",
    //         },
    //         {
    //             product_name: "Examine Lamp LED",
    //             product_type: "BEL-103-LED",
    //         },
    //         {
    //             product_name: "Examine Table (Meja Periksa)",
    //             product_type: "BET-201",
    //         },
    //         {
    //             product_name: "Examine Table (Meja Periksa)",
    //             product_type: "BET-101",
    //         },
    //         {
    //             product_name: "Examination Table (Meja Periksa)",
    //             product_type: "BET-301",
    //         },
    //         {
    //             product_name: "Examine Table THT",
    //             product_type: "01ECB-1THT",
    //         },
    //         {
    //             product_name: "Examine Table Folding",
    //             product_type: "BET-205-FD",
    //         },
    //         {
    //             product_name: "Manual Examine Table",
    //             product_type: "BET-101-CSTM1",
    //         },
    //         {
    //             product_name: "Examine Table Advance",
    //             product_type: "BET-101-CSTM3",
    //         },
    //         {
    //             product_name: "Foot Step P/C",
    //             product_type: "BFS-101",
    //         },
    //         {
    //             product_name: "Foot Step S/S",
    //             product_type: "BFS-201",
    //         },
    //         {
    //             product_name: "Food Trolley 2 Door S/S (1 Pintu Depan : 8 Rack, 1 Pintu Belakang : 8 Rack)",
    //             product_type: "Custom",
    //         },
    //         {
    //             product_name: "Food Trolley 16 Rack (2 Door)",
    //             product_type: "BFT-205-16R",
    //         },
    //         {
    //             product_name: "Food Trolley 8 Tray",
    //             product_type: "BFT-201",
    //         },
    //         {
    //             product_name: "Food Trolley 16 Tray",
    //             product_type: "BFT-202",
    //         },
    //         {
    //             product_name: "Food Warmer Trolley 16 Trays",
    //             product_type: "BFT-202-16S",
    //         },
    //         {
    //             product_name: "Food Trolley 24 Rack",
    //             product_type: "BFT-203",
    //         },
    //         {
    //             product_name: "Food Trolley",
    //             product_type: "BFT-211-30F",
    //         },
    //         {
    //             product_name: "Food Trolley 32 Tray",
    //             product_type: "BFT-204-2F",
    //         },
    //         {
    //             product_name: "Gynaecolog Chair",
    //             product_type: "BGY-101",
    //         },
    //         {
    //             product_name: "Gynaecolog Chair",
    //             product_type: "BGY-201-CC",
    //         },
    //         {
    //             product_name: "Gynaecolog Chair",
    //             product_type: "BGY-201",
    //         },
    //         {
    //             product_name: "Gynaecolog Chair Electric",
    //             product_type: "BGY-202-CE",
    //         },
    //         {
    //             product_name: "Gynaecolog Chair",
    //             product_type: "BGY-201-BK",
    //         },
    //         {
    //             product_name: "Gynaecolog Chair Electric",
    //             product_type: "Custom",
    //         },
    //         {
    //             product_name: "Gynaecolog Examine Table",
    //             product_type: "BGT-201",
    //         },
    //         {
    //             product_name: "Gynaecolog Examine Table",
    //             product_type: "BGT-201-TC",
    //         },
    //         {
    //             product_name: "Hematology Analyzer 3 Diff Z-360",
    //             product_type: "Z-360",
    //         },
    //         {
    //             product_name: "High Alert Medicine Cabinet",
    //             product_type: "BAMC-101-02",
    //         },
    //         {
    //             product_name: "Hospital Bed 1 Crank ABS",
    //             product_type: "BHB-103-1ABS",
    //         },
    //         {
    //             product_name: "Hospital Bed 1 Crank ABS",
    //             product_type: "BHB-103-1CK",
    //         },
    //         {
    //             product_name: "Hospital Bed 2 Crank standar",
    //             product_type: "BHB-104-2C",
    //         },
    //         {
    //             product_name: "Hospital Bed 2 Crank ABS",
    //             product_type: "BHB-104-2ABS",
    //         },
    //         {
    //             product_name: "Hospital Bed 2 Crank ABS",
    //             product_type: "BHB-104-2CK",
    //         },
    //         {
    //             product_name: "Hospital Bed 3 Crank ABS",
    //             product_type: "BHB-105-3CK",
    //         },
    //         {
    //             product_name: "Hospital Bed 3 Crank ABS",
    //             product_type: "BHB-105-3ABS",
    //         },
    //         {
    //             product_name: "Hospital Bed Economi",
    //             product_type: "BHB-101-EC",
    //         },
    //         {
    //             product_name: "Hospital Bed Electric",
    //             product_type: "BHB-108-E",
    //         },
    //         {
    //             product_name: "Hospital Bed Electric",
    //             product_type: "BHB-108-CSTM",
    //         },
    //         {
    //             product_name: "ICU Bed",
    //             product_type: "BIB-101",
    //         },
    //         {
    //             product_name: "ICU Bed",
    //             product_type: "BIB-103-SD",
    //         },
    //         {
    //             product_name: "ICU Bed Deluxe",
    //             product_type: "BIB-101-E",
    //         },
    //         {
    //             product_name: "bipMED Incubator Digital Control",
    //             product_type: "BICB-101-DC",
    //         },
    //         {
    //             product_name: "bipMED Incubator Skin Servo Control",
    //             product_type: "BICB-103-SSC",
    //         },
    //         {
    //             product_name: "Sensor Skin Incubator Servo",
    //             product_type: "BICB-103-SSC-01",
    //         },
    //         {
    //             product_name: "bipMED Incubator Transport",
    //             product_type: "BIC-104-TR",
    //         },
    //         {
    //             product_name: "Incubator Transport",
    //             product_type: "BMICB-401-TR",
    //         },
    //         {
    //             product_name: "Incubator Standart pendek",
    //             product_type: "BIC-103-ST",
    //         },
    //         {
    //             product_name: "Incubator Termostat Tinggi",
    //             product_type: "BICB-105-ST",
    //         },
    //         {
    //             product_name: "Infant Incubator",
    //             product_type: "BICB-103-WGS",
    //         },
    //         {
    //             product_name: "Infant Warmer Standard",
    //             product_type: "BIW-301",
    //         },
    //         {
    //             product_name: "Infant Warmer",
    //             product_type: "BIW-305-BPT",
    //         },
    //         {
    //             product_name: "Infant Warmer Skin Servo",
    //             product_type: "BIW-304",
    //         },
    //         {
    //             product_name: "Infrared Therapy",
    //             product_type: "BIR-101-6L",
    //         },
    //         {
    //             product_name: "Infusion Pump",
    //             product_type: "BIP-301-02",
    //         },
    //         {
    //             product_name: "Infusion Pump",
    //             product_type: "BIP-301-03",
    //         },
    //         {
    //             product_name: "Infusion Stand (I.V. Stand)",
    //             product_type: "BIS-101-5W",
    //         },
    //         {
    //             product_name: "Infusion Stand 5 Wheel S/S",
    //             product_type: "BIS-201-5W",
    //         },
    //         {
    //             product_name: "Infusion Stand (I.V. Stand)",
    //             product_type: "BIS-101-4W",
    //         },
    //         {
    //             product_name: "Infusion Stand",
    //             product_type: "BIS-201-4W",
    //         },
    //         {
    //             product_name: "Infusion Stand (I.V. Stand)",
    //             product_type: "BIS-101-3W",
    //         },
    //         {
    //             product_name: "Infusion Stand (I.V. Stand)",
    //             product_type: "BIS-201-3W",
    //         },
    //         {
    //             product_name: "Instrument Cabinet 1 Pintu P/C",
    //             product_type: "BIC-101-1P",
    //         },
    //         {
    //             product_name: "Instrument Cabinet 2 Pintu",
    //             product_type: "BIC-103-2P",
    //         },
    //         {
    //             product_name: "Instrument Cabinet 1 Pintu S/S",
    //             product_type: "BIC-201-1P",
    //         },
    //         {
    //             product_name: "Instrument Cabinet 2 Pintu S/S",
    //             product_type: "BIC-201-2P",
    //         },
    //         {
    //             product_name: "Instrument Cabinet 2 Pintu S/S",
    //             product_type: "BIC-203-2P",
    //         },
    //         {
    //             product_name: "Instrument Glass Trolley P/C",
    //             product_type: "BIT - 101",
    //         },
    //         {
    //             product_name: "Instrument Trolley P/C",
    //             product_type: "BIT-102",
    //         },
    //         {
    //             product_name: "Instrument Trolley 1 Drawer P/C",
    //             product_type: "BIT - 102 - 1D",
    //         },
    //         {
    //             product_name: "Instrument Trolley 1 Drawer S/S",
    //             product_type: "BIT-202-1D",
    //         },
    //         {
    //             product_name: "Instrument Trolley 1 Drawer SS",
    //             product_type: "BIT-202-1DC",
    //         },
    //         {
    //             product_name: "Instrument Trolley 1 Drawer SS",
    //             product_type: "BIT-203-1DC",
    //         },
    //         {
    //             product_name: "Instrument Trolley 2 Drawer P/C",
    //             product_type: "BIT-101-2D",
    //         },
    //         {
    //             product_name: "Instrument Trolley 2 Drawer",
    //             product_type: "BIT-101-2D CSTM",
    //         },
    //         {
    //             product_name: "Instrument Trolley 2 Drawer S/S",
    //             product_type: "BIT-201-2D",
    //         },
    //         {
    //             product_name: "Instrument Trolley 2 Drawer S/S",
    //             product_type: "BIT-201-2DC",
    //         },
    //         {
    //             product_name: "Instrument Trolley 2 Drawer",
    //             product_type: "BIT-102-2D CSTM",
    //         },
    //         {
    //             product_name: "Instrument Trolley S/S",
    //             product_type: "BIT-202",
    //         },
    //         {
    //             product_name: "Instrument Trolley S/S 2 Tray",
    //             product_type: "BIT-204-2T",
    //         },
    //         {
    //             product_name: "Instrument Trolley",
    //             product_type: "BIT-203-2TX",
    //         },
    //         {
    //             product_name: "Instrument Trolley 3 Shelf",
    //             product_type: "BIT-203-3T",
    //         },
    //         {
    //             product_name: "Instrument Glass Trolley S/S",
    //             product_type: "BIT-201",
    //         },
    //         {
    //             product_name: "Isolation Chamber",
    //             product_type: "BAS-701-IS",
    //         },
    //         {
    //             product_name: "Isolation Chamber",
    //             product_type: "BAS-701-IS DELUXE",
    //         },
    //         {
    //             product_name: "Kursi THT Electric",
    //             product_type: "BEC-201-THT",
    //         },
    //         {
    //             product_name: "Kursi Roda Electric",
    //             product_type: "BKR-206-E",
    //         },
    //         {
    //             product_name: "Kursi Roda Timbangan",
    //             product_type: "BKR-208-S",
    //         },
    //         {
    //             product_name: "Kursi Sampling",
    //             product_type: "BPC-CSTM",
    //         },
    //         {
    //             product_name: "Laboratory Drying Rack",
    //             product_type: "Custom",
    //         },
    //         {
    //             product_name: "Laminar Air Flow",
    //             product_type: "BLA-101-LAM",
    //         },
    //         {
    //             product_name: "Laminar Air Flow",
    //             product_type: "BLA-103-ML",
    //         },
    //         {
    //             product_name: "Laminar Air Flow",
    //             product_type: "BLA-101-LAF",
    //         },
    //         {
    //             product_name: "Laminar Air Flow",
    //             product_type: "Custom",
    //         },
    //         {
    //             product_name: "Lampu UV Viewing Box Kromatografi",
    //             product_type: "Custom",
    //         },
    //         {
    //             product_name: "Laundry Trolley P/C",
    //             product_type: "BLT-101",
    //         },
    //         {
    //             product_name: "Laundry Trolley S/S",
    //             product_type: "BLT-201",
    //         },
    //         {
    //             product_name: "Laura Smart Urine Strip Reader",
    //             product_type: "Laura S",
    //         },
    //         {
    //             product_name: "Lemari AED",
    //             product_type: "BFA-101-L",
    //         },
    //         {
    //             product_name: "Lemari Asam",
    //             product_type: "BLA-101",
    //         },
    //         {
    //             product_name: "Lemari Asam / Fume Hoods",
    //             product_type: "BLA-102-KD",
    //         },
    //         {
    //             product_name: "Lemari Asam",
    //             product_type: "BLA-201-C",
    //         },
    //         {
    //             product_name: "Lemari B3 (Inflammable Cabinet) 45 Gallons",
    //             product_type: "BLPK-201",
    //         },
    //         {
    //             product_name: "Lemari B3 (Inflammable Cabinet) 60 Gallons",
    //             product_type: "BLPK-202",
    //         },
    //         {
    //             product_name: "Lemari Baju C-Arm",
    //             product_type: "Custom",
    //         },
    //         {
    //             product_name: "Lemari Cabinet Cathlab",
    //             product_type: "BIC-401-2PA",
    //         },
    //         {
    //             product_name: "Lemari Dializer + Lampu UV",
    //             product_type: "BLDS-102-100D",
    //         },
    //         {
    //             product_name: "Lemari Dializer + Lampu UV",
    //             product_type: "BLDS-102-80D",
    //         },
    //         {
    //             product_name: "Lemari Dialyzer",
    //             product_type: "BLDS-102-80SS",
    //         },
    //         {
    //             product_name: "Lemari Fire Safety And First Aid Rescue",
    //             product_type: "BLP-102",
    //         },
    //         {
    //             product_name: "Linen Trolley S/S",
    //             product_type: "BLNT-201",
    //         },
    //         {
    //             product_name: "Linen trolley PC",
    //             product_type: "BLNT-101",
    //         },
    //         {
    //             product_name: "Lemari Narkotik (S)",
    //             product_type: "BIC-104-N",
    //         },
    //         {
    //             product_name: "Lemari Narkotik (M)",
    //             product_type: "BIC-105-N",
    //         },
    //         {
    //             product_name: "Lemari Narkotik (L)",
    //             product_type: "BIC-106-N",
    //         },
    //         {
    //             product_name: "Long Spinal Board",
    //             product_type: "BAS-307-K",
    //         },
    //         {
    //             product_name: "Mattres 14 cm",
    //             product_type: "BMA-302",
    //         },
    //         {
    //             product_name: "Matrass 12 cm",
    //             product_type: "BMA-303",
    //         },
    //         {
    //             product_name: "Matrass 10 cm",
    //             product_type: "BMA-301",
    //         },
    //         {
    //             product_name: "Medicine Cabinet 1 Pintu P/C Side Glass",
    //             product_type: "BMC - 101 - 1CSTM",
    //         },
    //         {
    //             product_name: "Medicine Cabinet Acrylic",
    //             product_type: "BMC-102-1A",
    //         },
    //         {
    //             product_name: "Medicine Cabinet 1 Pintu P/C Side Glass",
    //             product_type: "BMC - 101 - 1P",
    //         },
    //         {
    //             product_name: "Medicine Cabinet 1 Pintu S/S",
    //             product_type: "BMC - 201 - 1P",
    //         },
    //         {
    //             product_name: "Medicine Cabinet 2 Pintu P/C",
    //             product_type: "BMC - 103 - 2P",
    //         },
    //         {
    //             product_name: "Medicine Cabinet 2 Pintu S/S",
    //             product_type: "BMC - 203 - 2P",
    //         },
    //         {
    //             product_name: "Medical Treatment Cabinet",
    //             product_type: "BSC-101-CSTM1",
    //         },
    //         {
    //             product_name: "Medicine Trolley 24 Rack P/C (Plastik)",
    //             product_type: "BMT-103-24PL",
    //         },
    //         {
    //             product_name: "Medicine Trolley 36 Rak P/C (Plastik)",
    //             product_type: "BMT-103-36PL",
    //         },
    //         {
    //             product_name: "Medicine Trolley 8 Rack P/C (Plastik)",
    //             product_type: "BMT-103-8PL",
    //         },
    //         {
    //             product_name: "Medicine Trolley 36 Rak P/C (Plastik)",
    //             product_type: "BMT-103-36PLC",
    //         },
    //         {
    //             product_name: "Medicine Freezer",
    //             product_type: "01BLOB-5MF153",
    //         },
    //         {
    //             product_name: "Medical Cabinet Warmer",
    //             product_type: "BMCW-101",
    //         },
    //         {
    //             product_name: "Medical Waste Cold Storage 150 L",
    //             product_type: "BCS-104",
    //         },
    //         {
    //             product_name: "Medical Waste Cold Storage 210 L",
    //             product_type: "BCS-104",
    //         },
    //         {
    //             product_name: "Medical Waste Cold Storage 410 L",
    //             product_type: "BCS-104",
    //         },
    //         {
    //             product_name: "Medical Waste Cold Storage 825 L",
    //             product_type: "BCS-104",
    //         },
    //         {
    //             product_name: "Medical Waster Refrigerator",
    //             product_type: "01BLOB-4MWR210",
    //         },
    //         {
    //             product_name: "Medical Waster Refrigerator",
    //             product_type: "01BLOB-4MWR310",
    //         },
    //         {
    //             product_name: "Medical Waster Refrigerator",
    //             product_type: "01BLOB-4MWR410",
    //         },
    //         {
    //             product_name: "Meja Cuci 3 Sink",
    //             product_type: "BCS-304-3S",
    //         },
    //         {
    //             product_name: "Meja Sink S/S",
    //             product_type: "Custom",
    //         },
    //         {
    //             product_name: "Meja Sink CSSD 3 Person",
    //             product_type: "Custom",
    //         },
    //         {
    //             product_name: "Mesin Negative Pressure",
    //             product_type: "Custom",
    //         },
    //         {
    //             product_name: "Mobile Cassete Holder",
    //             product_type: "BXS-102-C",
    //         },
    //         {
    //             product_name: "Mobile Stand Bucky",
    //             product_type: "BXS-102-C2",
    //         },
    //         {
    //             product_name: "Mobile Wastafel (Bahan HPL)",
    //             product_type: "Custom",
    //         },
    //         {
    //             product_name: "Mortuary Carriage S/S",
    //             product_type: "BMO-302",
    //         },
    //         {
    //             product_name: "Mortuary Carriage",
    //             product_type: "BMO - 201",
    //         },
    //         {
    //             product_name: "Mortuary Refrigerator 2 Pintu",
    //             product_type: "BMO - 203 - 2SD",
    //         },
    //         {
    //             product_name: "Mortuary Refrigerator 3 Person",
    //             product_type: "BMO-203-3P",
    //         },
    //         {
    //             product_name: "Mortuary Freezer 2 Person",
    //             product_type: "BMO-203-2F",
    //         },
    //         {
    //             product_name: "Mortuary Refrigerator 2 Person",
    //             product_type: "BMO-203-2P",
    //         },
    //         {
    //             product_name: "Mortuary Freezer 3 Person",
    //             product_type: "BMO-203-3F",
    //         },
    //         {
    //             product_name: "Mortuary Table",
    //             product_type: "BMO - 201 - T",
    //         },
    //         {
    //             product_name: "Body Trolley Lift",
    //             product_type: "BBTL-202-HD",
    //         },
    //         {
    //             product_name: "Mobilisation Belt",
    //             product_type: "BMB-101",
    //         },
    //         {
    //             product_name: "Mayo Stand P/C",
    //             product_type: "BMS-101",
    //         },
    //         {
    //             product_name: "Mayo Stand SS Top Stainless",
    //             product_type: "BMS-201",
    //         },
    //         {
    //             product_name: "Mayo Stand",
    //             product_type: "BMS-201-CS",
    //         },
    //         {
    //             product_name: "Mayo Stand SS Top Wood",
    //             product_type: "BMS - 202",
    //         },
    //         {
    //             product_name: "Mayo Stand / Over Bed Table GS",
    //             product_type: "BMS-102-GS",
    //         },
    //         {
    //             product_name: "Mayo Stand",
    //             product_type: "BMS-203",
    //         },
    //         {
    //             product_name: "Mayo Stand",
    //             product_type: "BMS-201-CS2",
    //         },
    //         {
    //             product_name: "Mayo Stand / Over Bed Table ABS",
    //             product_type: "BMSG-101-ABS",
    //         },
    //         {
    //             product_name: "Neil Robertson Rescue Stretcher",
    //             product_type: "Custom",
    //         },
    //         {
    //             product_name: "Over Bed Table P/C",
    //             product_type: "BMS - 101-C",
    //         },
    //         {
    //             product_name: "Operating Table",
    //             product_type: "BOT-101-GS",
    //         },
    //         {
    //             product_name: "Operating Table Electric",
    //             product_type: "BOT-209-1AC",
    //         },
    //         {
    //             product_name: "Ophthalmology Exam Chair",
    //             product_type: "BEC-102-OEC",
    //         },
    //         {
    //             product_name: "Paraguard Stretcher",
    //             product_type: "BAS-401-P",
    //         },
    //         {
    //             product_name: "Patient Monitor 12 Inch",
    //             product_type: "BPM-301-02",
    //         },
    //         {
    //             product_name: "Pathology Workstation",
    //             product_type: "BPTL-201",
    //         },
    //         {
    //             product_name: "Pathology Grossing Station",
    //             product_type: "BPTL-202",
    //         },
    //         {
    //             product_name: "Pulse Oxymeter",
    //             product_type: "BHPO-301-01",
    //         },
    //         {
    //             product_name: "Pulse Oximeter Adult",
    //             product_type: "BHPO-301-02",
    //         },
    //         {
    //             product_name: "Plasma Extractor",
    //             product_type: "BPE-201",
    //         },
    //         {
    //             product_name: "Portable Autopsy Table",
    //             product_type: "BMO-201-PAT",
    //         },
    //         {
    //             product_name: "Pharmaceutical Refrigerator",
    //             product_type: "BBLO-101-PRD",
    //         },
    //         {
    //             product_name: "Pharmaceutical Refrigerator Double 568 L",
    //             product_type: "BBLO-101-PRD",
    //         },
    //         {
    //             product_name: "Pharmaceutical Refrigerator",
    //             product_type: "BBLO-102-PRS",
    //         },
    //         {
    //             product_name: "Pharmaceutical / Reagent Refrigerator Double 730 L",
    //             product_type: "BBLO-101-PRD",
    //         },
    //         {
    //             product_name: "Pharmaceutical Refrigerator 3 Door 1500L",
    //             product_type: "BBLO-101-3D",
    //         },
    //         {
    //             product_name: "Pharmaceutical Refrigerator 3 Door 1100 L",
    //             product_type: "BBLO-101-3D",
    //         },
    //         {
    //             product_name: "Pharmaceutical Refrigerator",
    //             product_type: "BBLO-102-VR",
    //         },
    //         {
    //             product_name: "Pharmaceutical Refrigerator",
    //             product_type: "BBLO-104-VS",
    //         },
    //         {
    //             product_name: "Pharmaceutical Refrigerator",
    //             product_type: "BBLO-202-PRM",
    //         },
    //         {
    //             product_name: "Pharmaceutical Refrigerator",
    //             product_type: "BBLO-105-ILR",
    //         },
    //         {
    //             product_name: "Pharmaceutical Refrigerator Single 380 L",
    //             product_type: "BBLO-102-PR",
    //         },
    //         {
    //             product_name: "Pharmaceutical Refrigerator 70 L",
    //             product_type: "BBLO-102-PRS70",
    //         },
    //         {
    //             product_name: "Vaccine Carrier 36 Liter Mobile",
    //             product_type: "BVC-101-36L",
    //         },
    //         {
    //             product_name: "Vaccine Carrier",
    //             product_type: "BVC-101-8L",
    //         },
    //         {
    //             product_name: "Vaccine Carrier",
    //             product_type: "BVC-101-12LB",
    //         },
    //         {
    //             product_name: "Vaccine Carrier",
    //             product_type: "BVC-101-12L",
    //         },
    //         {
    //             product_name: "Vaccine Refrigerator",
    //             product_type: "BBLO-102-VR288",
    //         },
    //         {
    //             product_name: "Vaccine Refrigerator",
    //             product_type: "BBLO-102-VR378",
    //         },
    //         {
    //             product_name: "Vaccine Refrigerator 2 Door 568L",
    //             product_type: "BBLO-102-VR600",
    //         },
    //         {
    //             product_name: "Vaccine Refrigerator 2 Door 625L",
    //             product_type: "BBLO-102-VR600",
    //         },
    //         {
    //             product_name: "Vaccine Refrigerator 3 Door",
    //             product_type: "BBLO-102-VR1450",
    //         },
    //         {
    //             product_name: "Vaccine Storage 100L",
    //             product_type: "BBLO-404-V100",
    //         },
    //         {
    //             product_name: "Vaccine Storage (-25 s/d -15⁰ C) 150 L",
    //             product_type: "BBLO-104-VS150",
    //         },
    //         {
    //             product_name: "Vaccine Storage (-25 s/d -15⁰ C) 210 L",
    //             product_type: "BBLO-104-VS210",
    //         },
    //         {
    //             product_name: "Vaccine Storage (-25 s/d -15⁰ C) 330 L",
    //             product_type: "BBLO-104-VS330",
    //         },
    //         {
    //             product_name: "Vaccine Storage (0 s/d 8⁰ C) 150 L",
    //             product_type: "BBLO-204-VS150",
    //         },
    //         {
    //             product_name: "Vaccine Storage (0 s/d 8⁰ C) 210 L",
    //             product_type: "BBLO-204-VS210",
    //         },
    //         {
    //             product_name: "Vaccine Storage (0 s/d 8⁰ C) 330 L",
    //             product_type: "BBLO-204-VS330",
    //         },
    //         {
    //             product_name: "Vaccine Storage",
    //             product_type: "BBLO-304-VS150",
    //         },
    //         {
    //             product_name: "Vaccine Storage (-25 s/d 8° C) 210 L",
    //             product_type: "BBLO-304-VS210",
    //         },
    //         {
    //             product_name: "Vaccine Storage (-25 s/d 8° C) 330 L",
    //             product_type: "BBLO-304-VS330",
    //         },
    //         {
    //             product_name: "Vaccine Storage (-25 s/d -15° C) 410 L",
    //             product_type: "BBLO-104",
    //         },
    //         {
    //             product_name: "Vaccine Storage (0 s/d 8° C) 410 L",
    //             product_type: "BBLO-204",
    //         },
    //         {
    //             product_name: "Vaccine Storage (-25 s/d -15º C) 419 L",
    //             product_type: "BBLO-104",
    //         },
    //         {
    //             product_name: "Vaccine Storage (-25 s/d -15° C) 510 L",
    //             product_type: "BBLO-104",
    //         },
    //         {
    //             product_name: "Vaccine Storage (0-8° C) 510 L",
    //             product_type: "BBLO-204",
    //         },
    //         {
    //             product_name: "Vaccine Storage (-25 s/d 8° C) 510 L",
    //             product_type: "BBLO-304",
    //         },
    //         {
    //             product_name: "Vaccine Storage (-25 s/d 8° C) 550 L",
    //             product_type: "BBLO-304",
    //         },
    //         {
    //             product_name: "Vaccine Storage (-25 s/d 8° C) 410 L",
    //             product_type: "BBLO-304",
    //         },
    //         {
    //             product_name: "Vaccine Storage (-25 s/d -15⁰ C) 610 L",
    //             product_type: "BBLO-104",
    //         },
    //         {
    //             product_name: "Vaccine Storage (0 s/d 8⁰ C) 610 L",
    //             product_type: "BBLO-204",
    //         },
    //         {
    //             product_name: "Vaccine Storage (-25 s/d 8° C) 610 L",
    //             product_type: "BBLO-304",
    //         },
    //         {
    //             product_name: "Patient Trolley",
    //             product_type: "Custom",
    //         },
    //         {
    //             product_name: "Professional Audiometer",
    //             product_type: "SY-6055",
    //         },
    //         {
    //             product_name: "Phlebetomy Chair Electric",
    //             product_type: "BPC-102-E",
    //         },
    //         {
    //             product_name: "Phlebetomy Chair Elektric",
    //             product_type: "BPC-201-E",
    //         },
    //         {
    //             product_name: "Phlebetomy Chair P/C",
    //             product_type: "BPC-101",
    //         },
    //         {
    //             product_name: "Phlebetomy Chair S/S",
    //             product_type: "BPC-201",
    //         },
    //         {
    //             product_name: "Phlebetomy Chair (Kursi Sampling)",
    //             product_type: "BPC-104-M",
    //         },
    //         {
    //             product_name: "Phlebetomy Chair with Drawer",
    //             product_type: "Custom",
    //         },
    //         {
    //             product_name: "Pass Box",
    //             product_type: "BPB-201",
    //         },
    //         {
    //             product_name: "Pass Box Tanpa PB",
    //             product_type: "BIC-132-PB",
    //         },
    //         {
    //             product_name: "Radiology Table",
    //             product_type: "BRT-101-C",
    //         },
    //         {
    //             product_name: "Radiology Table P/C",
    //             product_type: "BRT-101",
    //         },
    //         {
    //             product_name: "Radiology Table",
    //             product_type: "BRT-103",
    //         },
    //         {
    //             product_name: "Rak Lemari Appron X-Ray",
    //             product_type: "Custom",
    //         },
    //         {
    //             product_name: "Rak Lemari Apron X-Ray",
    //             product_type: "BRA-201-02",
    //         },
    //         {
    //             product_name: "Rak Tabung S/S (50 Lubang, 12x75)",
    //             product_type: "Custom",
    //         },
    //         {
    //             product_name: "Resussitasi Table (Baby Tafel)",
    //             product_type: "BTA-201-L",
    //         },
    //         {
    //             product_name: "Semi Automatic Chemistry Analyzer",
    //             product_type: "C-100",
    //         },
    //         {
    //             product_name: "Semi Automatic Clinical Chemistry Analyzer",
    //             product_type: "Chem 5 V3",
    //         },
    //         {
    //             product_name: "Semi Automatic Clinical Chemistry Analyzer",
    //             product_type: "Chem 7",
    //         },
    //         {
    //             product_name: "Slide Cabinet (Uk. 69 x 98 x 82 cm)",
    //             product_type: "Custom",
    //         },
    //         {
    //             product_name: "Slide Storage Cabinet",
    //             product_type: "BBSC-101-5C",
    //         },
    //         {
    //             product_name: "Snelen Chart (Non Remote)",
    //             product_type: "BSN-302",
    //         },
    //         {
    //             product_name: "Snelen Chart (Remote Control)",
    //             product_type: "BSN-302-R",
    //         },
    //         {
    //             product_name: "Snelen Chart",
    //             product_type: "BSN-301",
    //         },
    //         {
    //             product_name: "Scoop Strecher",
    //             product_type: "BAS-311-SC",
    //         },
    //         {
    //             product_name: "Scrub Station 1 Person",
    //             product_type: "BSR-201-1P",
    //         },
    //         {
    //             product_name: "Scrub Station 2 person",
    //             product_type: "BSR-202-2P",
    //         },
    //         {
    //             product_name: "Scrub Station Double",
    //             product_type: "BSR-204-2P",
    //         },
    //         {
    //             product_name: "Scrub Station 1 Person",
    //             product_type: "BSR-201-1PM",
    //         },
    //         {
    //             product_name: "Stainless Steel Labjack",
    //             product_type: "CUSTOM",
    //         },
    //         {
    //             product_name: "Stand Waskom Single S/S",
    //             product_type: "BSW-201-S",
    //         },
    //         {
    //             product_name: "Stand Waskom Single P/C",
    //             product_type: "BSW-101-S",
    //         },
    //         {
    //             product_name: "Stand Waskom Double S/S",
    //             product_type: "BSW-201-D",
    //         },
    //         {
    //             product_name: "Stand Waskom Single Deluxe",
    //             product_type: "BSW-201-SD",
    //         },
    //         {
    //             product_name: "Stand Waskom Double Deluxe S/S",
    //             product_type: "BSW-201-DD",
    //         },
    //         {
    //             product_name: "Standing Apron Kayu",
    //             product_type: "BHA-202-WD",
    //         },
    //         {
    //             product_name: "Sterilisator",
    //             product_type: "YXF-320",
    //         },
    //         {
    //             product_name: "Solar Power (PLTS) 5 KW Hybrid Smart System",
    //             product_type: "BIPOWER S5",
    //         },
    //         {
    //             product_name: "Solar Power (PLTS) 8 KW Hybrid Smart System",
    //             product_type: "BIPOWER S8",
    //         },
    //         {
    //             product_name: "Solar Power (PLTS) 10 KW Hybrid Smart System",
    //             product_type: "BIPOWER S10",
    //         },
    //         {
    //             product_name: "Solar Power (PLTS) 12 KW Hybrid Smart System",
    //             product_type: "BIPOWER S12",
    //         },
    //         {
    //             product_name: "Sound Proof Chamber Audiometri (HPL)",
    //             product_type: "BSA-401-T",
    //         },
    //         {
    //             product_name: "Sound Proof Chamber Audiometri (Melamic)",
    //             product_type: "BSA-401-M",
    //         },
    //         {
    //             product_name: "Sphygmomanometer Portable with Trolley",
    //             product_type: "BTM-301-03",
    //         },
    //         {
    //             product_name: "Spirometer Manual",
    //             product_type: "Custom",
    //         },
    //         {
    //             product_name: "Standart Cassete (X-Ray Film Stand Holder S/S)",
    //             product_type: "BXS-201",
    //         },
    //         {
    //             product_name: "Standart Cassete (X-Ray Film Stand Holder) P/C",
    //             product_type: "BXS-101",
    //         },
    //         {
    //             product_name: "Stand Trolley Nebulizer",
    //             product_type: "BTK-104-TN",
    //         },
    //         {
    //             product_name: "Stool Chair P/C",
    //             product_type: "BSTO-101",
    //         },
    //         {
    //             product_name: "Stool Chair S/S",
    //             product_type: "BSTO-202",
    //         },
    //         {
    //             product_name: "Stool Chair",
    //             product_type: "Custom",
    //         },
    //         {
    //             product_name: "Suction Pump Portable",
    //             product_type: "BSU-301",
    //         },
    //         {
    //             product_name: "Syringe Pump",
    //             product_type: "BSP-301-02",
    //         },
    //         {
    //             product_name: "Syringe Pump",
    //             product_type: "BSP-301-03",
    //         },
    //         {
    //             product_name: "Transfer Stretcher Trolley",
    //             product_type: "BBP-110-TST",
    //         },
    //         {
    //             product_name: "Tempat Tidur Susun",
    //             product_type: "Custom",
    //         },
    //         {
    //             product_name: "Tensimeter Stand",
    //             product_type: "BTK-103-TS",
    //         },
    //         {
    //             product_name: "Trolley Oksigen 1m3",
    //             product_type: "BOXT-101-1",
    //         },
    //         {
    //             product_name: "Oxygen Trolley",
    //             product_type: "BOXT-101-1,5",
    //         },
    //         {
    //             product_name: "Oxygen Trolley 6 m³",
    //             product_type: "BOXT-101-6",
    //         },
    //         {
    //             product_name: "Oxygen Trolley",
    //             product_type: "BOXT-201-6",
    //         },
    //         {
    //             product_name: "Tandu Lipat (4 Lipat)",
    //             product_type: "Custom",
    //         },
    //         {
    //             product_name: "Transfer Patient",
    //             product_type: "BTP-101-N",
    //         },
    //         {
    //             product_name: "Trolley USG",
    //             product_type: "BUT-101-D",
    //         },
    //         {
    //             product_name: "USG Ultrasound Diagnostic System",
    //             product_type: "BUS-301-BW",
    //         },
    //         {
    //             product_name: "U.V. Moble Room Sterilizer",
    //             product_type: "BUV-201-4LR",
    //         },
    //         {
    //             product_name: "U.V. Moble Room Sterilizer",
    //             product_type: "BUV-201-5L",
    //         },
    //         {
    //             product_name: "Urinal Carriage P/C",
    //             product_type: "BUC-101",
    //         },
    //         {
    //             product_name: "Verlos Bed S/S",
    //             product_type: "BVB-201",
    //         },
    //         {
    //             product_name: "Velbed + Matrass",
    //             product_type: "BVB-401-S",
    //         },
    //         {
    //             product_name: "Vital Sign",
    //             product_type: "BVSM-301-01",
    //         },
    //         {
    //             product_name: "Vital Sign Monitor",
    //             product_type: "BVSM-301-01",
    //         },
    //         {
    //             product_name: "Water Treatment Plant (WTP) 2 M³/hari",
    //             product_type: "BWTP-101-02",
    //         },
    //         {
    //             product_name: "Water Treatment Plant (WTP) 3 M³/hari",
    //             product_type: "BWTP-101-03",
    //         },
    //         {
    //             product_name: "Water Treatment Plant (WTP) 5 M³/hari",
    //             product_type: "BWTP-101-05",
    //         },
    //         {
    //             product_name: "Water Treatment Plant (WTP) + Ro 2 M³/hari",
    //             product_type: "BWTP-101-02",
    //         },
    //         {
    //             product_name: "Water Treatment Plant (WTP) + Ro 3 M³/hari",
    //             product_type: "BWTP-101-03",
    //         },
    //         {
    //             product_name: "Water Treatment Plant (WTP) + Ro 5 M³/hari",
    //             product_type: "BWTP-101-05",
    //         },
    //         {
    //             product_name: "Waiting Chair 4 Person",
    //             product_type: "BWC-104",
    //         },
    //         {
    //             product_name: "Wheel Chair",
    //             product_type: "BKR-202",
    //         },
    //         {
    //             product_name: "Wheel Chair",
    //             product_type: "BKR-203-PPT",
    //         },
    //         {
    //             product_name: "Wheel Chair",
    //             product_type: "BKR-204",
    //         },
    //         {
    //             product_name: "Wheel Chair",
    //             product_type: "BKR-204-CVD",
    //         },
    //         {
    //             product_name: "Wheel Chair (Pediatric)",
    //             product_type: "BKR-205",
    //         },
    //         {
    //             product_name: "Wheel Chair (Non-Magnetic)",
    //             product_type: "BKR-207-NM",
    //         },
    //         {
    //             product_name: "Xray Apron Pelindung",
    //             product_type: "BXA-101",
    //         },
    //         {
    //             product_name: "Xray Viewer Double LED",
    //             product_type: "BXR - 101 - LED",
    //         },
    //         {
    //             product_name: "Xray Viewer Double LED",
    //             product_type: "BXR-102-DDH",
    //         },
    //         {
    //             product_name: "Xray Viewer Double",
    //             product_type: "BXR-101-D",
    //         },
    //         {
    //             product_name: "Xray Viewer Double LED + Remote",
    //             product_type: "BXR-102-DCR",
    //         },
    //         {
    //             product_name: "X-Ray Viewer Double + Dimmer",
    //             product_type: "BXR-101-DD",
    //         },
    //         {
    //             product_name: "X-Ray Viewer Single + Dimmer",
    //             product_type: "BXR-101-SD",
    //         },
    //         {
    //             product_name: "Xray Viewer Single",
    //             product_type: "BXR-101-S",
    //         },
    //         {
    //             product_name: "Xray Viewer Single LED",
    //             product_type: "BXR-102-LED",
    //         },
    //         {
    //             product_name: "X - Ray Barrier",
    //             product_type: "BXR-301",
    //         },
    //         {
    //             product_name: "X - Ray Barrier",
    //             product_type: "Custom",
    //         },
    //     ],
    //     skipDuplicates: true,
    // });

    // await prisma.product_code.createMany({
    //     data: [
    //         {
    //             // id: 1,
    //             product_code: "BAS3",
    //             product_id: 1,
    //         },
    //         {
    //             // id: 2,
    //             product_code: "BAS4",
    //             product_id: 1,
    //         },
    //         {
    //             // id: 3,
    //             product_code: "BED1",
    //             product_id: 2,
    //         },
    //         {
    //             // id: 4,
    //             product_code: "BAS5",
    //             product_id: 1,
    //         },
    //         {
    //             // id: 5,
    //             product_code: "test123",
    //             product_id: 4,
    //         },
    //         {
    //             // id: 6,
    //             product_code: "test1",
    //             product_id: 3,
    //         },
    //         {
    //             // id: 7,
    //             product_code: "test2",
    //             product_id: 3,
    //         },
    //     ],
    //     skipDuplicates: true,
    // });

    // const productionCount = await prisma.production_code.count();

    // if (productionCount === 0) {
    //     await prisma.production_code.create({
    //         data: {
    //             product_id: 1,
    //             product_code_id: 1,
    //             customer_id: 1,
    //             user_id: admin.id,

    //             batch: "VI26",
    //             production_number: "0002",
    //             production_code: "BAS3-VI260002",

    //             spk: "E-059",
    //             remarks: null,
    //             out_code: new Date("2026-06-18"),
    //             Item_code_recipient: "Assembly",
    //             status: "Assembly",
    //         },
    //     });
    // }

    console.log("Seed berhasil dijalankan.");
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });

