import { Router } from "express";

const router = Router();

const BOM_RULES = [
  { test: /esp32/i, item: { name: "ESP32 development board", quantity: 1, reason: "Wi-Fi/Bluetooth capable controller option" } },
  { test: /arduino|uno|atmega/i, item: { name: "Arduino-compatible development board", quantity: 1, reason: "Beginner-friendly microcontroller platform" } },
  { test: /soil|plant|moisture|watering/i, item: { name: "Capacitive soil-moisture sensor", quantity: 1, reason: "Measures soil moisture; calibrate for your soil and sensor" } },
  { test: /ultrasonic|obstacle|distance|robot/i, item: { name: "Ultrasonic distance sensor", quantity: 1, reason: "Measures distance to nearby objects" } },
  { test: /temperature|humidity|weather/i, item: { name: "Temperature and humidity sensor module", quantity: 1, reason: "Captures environmental readings" } },
  { test: /display|oled|screen|monitor/i, item: { name: "I2C OLED display module", quantity: 1, reason: "Displays readings and device status" } },
  { test: /water|pump|watering/i, item: { name: "DC water pump", quantity: 1, reason: "Actuator for moving water; match voltage and flow requirements" } },
  { test: /motor|robot|wheel/i, item: { name: "Motor driver module", quantity: 1, reason: "Drives motors; select for motor voltage and stall current" } },
  { test: /relay|switch|light|lamp/i, item: { name: "Relay or suitable MOSFET driver", quantity: 1, reason: "Switches a load; choose based on load voltage/current" } },
  { test: /battery|portable|mobile/i, item: { name: "Battery pack with protection", quantity: 1, reason: "Power source; size after estimating current and runtime" } }
];

router.post("/analyze", (req, res) => {
  const idea = String(req.body?.idea || "").trim();
  const name = String(req.body?.name || "").trim().slice(0, 100);
  if (idea.length < 12) {
    return res.status(400).json({ error: "Describe your project in at least 12 characters." });
  }
  if (idea.length > 2000) {
    return res.status(400).json({ error: "Project description must be 2,000 characters or fewer." });
  }

  const matches = BOM_RULES.filter(rule => rule.test.test(idea));
  const bom = matches.map(rule => rule.item);
  if (!bom.some(item => /development board/.test(item.name))) {
    bom.unshift({ name: "Microcontroller development board", quantity: 1, reason: "Main controller; choose a board based on I/O, connectivity and voltage needs" });
  }
  if (!bom.some(item => /jumper wires/.test(item.name))) {
    bom.push({ name: "Breadboard and jumper wires", quantity: 1, reason: "Useful for a first prototype and low-voltage connections" });
  }

  const requirements = [
    "Define the inputs the system must read and the outputs it must control",
    "Confirm the operating voltage and peak current for every module",
    "Choose a controller with enough GPIO, communication interfaces and memory",
    "Check sensor range, accuracy and environmental limits against the use case",
    "Plan a safe power source and common ground where required"
  ];
  if (/wifi|internet|remote|phone|app|cloud/i.test(idea)) requirements.push("Confirm Wi-Fi/network needs, security and offline behavior");
  if (/outdoor|rain|garden|plant/i.test(idea)) requirements.push("Protect electronics from moisture and outdoor exposure");

  const buildSteps = [
    "Break the idea into sensing, processing, output and power subsystems",
    "Select exact parts and read their datasheets before ordering",
    "Prototype the controller and each sensor separately on a breadboard",
    "Verify pin mapping, logic levels, current limits and power rails",
    "Integrate one subsystem at a time and test normal and failure cases",
    "Document the final wiring, firmware version and measured results"
  ];

  res.json({
    name: name || "New electronics project",
    summary: "A rule-based starter plan generated from your project description. Treat the component suggestions as candidates, not a verified design.",
    mode: "prototype-rules",
    requirements,
    bom,
    buildSteps,
    generatedAt: new Date().toISOString()
  });
});

export default router;
