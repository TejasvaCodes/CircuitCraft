import { useState } from "react";

const sections = [
  ["overview","01","System overview"],
  ["mechanism","02","Mechanical design"],
  ["parts","03","Component list"],
  ["wiring","04","Wiring map"],
  ["firmware","05","Firmware"],
  ["assembly","06","Build & test"]
];

const parts = [
  ["ESP32 DevKit V1","1","Main controller; 3.3 V GPIO","₹400–700","Controller"],
  ["12 V geared DC motor","1","Moves the tray; select torque after measuring loaded tray force","₹300–700","Motion"],
  ["TB6612FNG motor driver","1","H-bridge for a small DC motor; verify its current rating against motor stall current","₹150–300","Driver"],
  ["IR break-beam sensor","2","One for customer approach, one optional pickup-zone detection","₹100–250","Sensing"],
  ["Roller lever limit switch","2","Home and fully-extended end stops","₹40–100","Safety"],
  ["Plate-present sensor (load cell + HX711 or optical)","1","Confirms a plate is loaded / removed; prototype and calibrate","₹150–350","Sensing"],
  ["12 V regulated supply + 5 V buck converter","1","Motor rail and regulated logic rail","₹300–600","Power"],
  ["Linear drawer slides, tray, belt/pulley or lead screw","1 set","Physical sliding mechanism and removable food-safe tray","₹500–1,200","Mechanical"],
  ["Fuse, emergency stop, wiring, enclosure","1 set","Power protection, manual stop and guarded wiring","₹250–500","Safety"]
];

const connections = [
  ["IR presence OUT","ESP32 GPIO 18","3.3 V-compatible signal; use level shifting if sensor output is 5 V."],
  ["Home limit switch","ESP32 GPIO 25","Wire as active-low input with pull-up; debounce in firmware."],
  ["Front limit switch","ESP32 GPIO 26","Active-low input; stop motor immediately when reached."],
  ["Plate sensor output","ESP32 GPIO 27 / ADC","Exact interface depends on chosen optical sensor or HX711 module."],
  ["Motor driver IN1 / IN2","ESP32 GPIO 16 / 17","Direction control; confirm driver truth table."],
  ["Motor driver PWM","ESP32 GPIO 23","Speed control; keep motor current off the ESP32 board."],
  ["Motor driver VM","12 V fused supply","Supply must handle motor start/stall current."],
  ["ESP32 VIN / 5V","5 V buck converter","Regulated logic supply; common ground where driver requires it."]
];

const stages = [
  ["Prototype the tray by hand","Make a tray that slides freely on two drawer rails. Check that one plate sits flat and cannot tip."],
  ["Test the sensors","Connect the IR sensor and both limit switches. Read their states in Serial Monitor and verify stable detection."],
  ["Test motor and driver separately","With the tray unloaded, run the motor slowly in both directions. Confirm emergency stop cuts motor power."],
  ["Add end-stop control","Stop at home/front limit switches. Add a firmware timeout so a failed switch cannot run the motor indefinitely."],
  ["Add plate detection","Calibrate the plate-present sensor with an empty tray and a plate. Reject ambiguous readings."],
  ["Integrate the state machine","Implement one dispense cycle, pickup wait, retract and lockout until the customer leaves."],
  ["Guard and repeat-test","Cover pinch points, isolate electronics from spills and run at least 30 cycles before any real-world trial."]
];

export default function DemoProject({ onBack }) {
  const [active,setActive] = useState("overview");
  const [done,setDone] = useState([]);
  const [copied,setCopied] = useState(false);
  const toggle = (i) => setDone(old => old.includes(i) ? old.filter(x=>x!==i) : [...old,i]);
  const code = `// ESP32 prototype state-machine skeleton
// Set GPIO numbers only after checking your exact modules.
enum State { IDLE, EXTEND, WAIT_PICKUP, RETRACT, LOCKOUT, FAULT };
State state = IDLE;

void loop() {
  readAndDebounceSensors();
  if (emergencyStopPressed()) {
    motorOff();
    state = FAULT;
  }

  switch (state) {
    case IDLE:
      if (customerDetected() && trayAtHome()
          && plateLoaded() && pickupZoneClear()) {
        state = EXTEND;
      }
      break;
    case EXTEND:
      if (frontLimitPressed()) { motorOff(); state = WAIT_PICKUP; }
      else if (travelTimedOut() || obstructionDetected()) faultStop();
      else moveTrayForwardSlowly();
      break;
    case WAIT_PICKUP:
      if (plateRemoved()) state = RETRACT;
      break;
    case RETRACT:
      if (homeLimitPressed()) { motorOff(); state = LOCKOUT; }
      else if (travelTimedOut()) faultStop();
      else moveTrayBackwardSlowly();
      break;
    case LOCKOUT:
      if (customerHasLeft()) state = IDLE;
      break;
    case FAULT:
      motorOff(); // require manual inspection and reset
      break;
  }
}`;
  return <main className="demo-workspace">
    <button className="text-action" onClick={onBack}>← Back to My Builds</button>
    <div className="demo-hero">
      <div><div className="panel-kicker">CIRCUITCRAFT · COMPLETE WALKTHROUGH</div><h1>Automatic Pani Puri<br/><span>Plate Dispenser</span></h1><p>One complete beginner-friendly prototype journey — from the physical mechanism to firmware and test checklist.</p><div className="demo-tags"><span>ESP32</span><span>DC motor</span><span>IR sensing</span><span>Prototype V1</span></div></div>
      <div className="demo-status"><b>DEMO PROJECT</b><strong>{Math.round(done.length/stages.length*100)}%</strong><small>Build checklist complete</small><div className="demo-progress"><i style={{width:(done.length/stages.length*100)+"%"}}/></div></div>
    </div>
    <div className="demo-layout">
      <aside className="demo-sidebar"><div className="panel-kicker">PROJECT GUIDE</div>{sections.map(([id,n,label])=><button key={id} className={active===id?"demo-side-link active":"demo-side-link"} onClick={()=>setActive(id)}><span>{n}</span>{label}</button>)}<div className="demo-side-note">Prototype scope<strong>One plate per cycle</strong><small>Automatic stack separation is intentionally out of scope for V1.</small></div></aside>
      <section className="demo-main">
        {active==="overview" && <><div className="panel-kicker">01 · SYSTEM OVERVIEW</div><h2>What are we building?</h2><p className="demo-lead">A customer approaches the counter. The machine detects them, moves one pre-loaded plate on a sliding tray, waits until the plate is picked up, then returns the tray and rearms.</p><div className="demo-flow">{["Customer detected","Controller checks safe state","Tray slides forward","Plate picked up","Tray returns home"].map((x,i)=><div key={x}><b>0{i+1}</b><strong>{x}</strong></div>)}</div><h3>System blocks</h3><div className="demo-two-col"><article><b>Sensing</b><p>Presence sensor, plate-present sensor and two end-stop switches provide feedback.</p></article><article><b>Control</b><p>ESP32 runs a state machine and prevents repeat dispensing while a customer remains in front.</p></article><article><b>Actuation</b><p>Motor driver powers a low-speed geared motor that moves the tray along rails.</p></article><article><b>Power & safety</b><p>Fused motor supply, regulated logic rail, emergency stop and guarded pinch points.</p></article></div><div className="demo-callout"><b>Important scope choice</b><p>For the first working demo, manually load one plate onto the tray. A stack magazine that separates plates is a separate mechanical challenge for V2.</p></div></>}
        {active==="mechanism" && <><div className="panel-kicker">02 · MECHANICAL DESIGN</div><h2>How the plate physically moves</h2><p className="demo-lead">Build a small motorized drawer. This is easier to prototype and debug than a plate-stacking dispenser.</p><div className="mechanism-steps"><div><b>01</b><strong>Fixed base</strong><p>Mount two parallel drawer slides to a rigid base under the counter.</p></div><div><b>02</b><strong>Moving tray</strong><p>Attach a removable, washable food-safe tray to the sliding members.</p></div><div><b>03</b><strong>Drive</strong><p>Couple a geared motor to a belt/pulley or lead-screw. Add hard stops at both ends.</p></div><div><b>04</b><strong>End stops</strong><p>Place one roller switch at home and one at full extension. Guard all pinch points.</p></div></div><div className="demo-callout"><b>Measure before buying the motor</b><p>Measure loaded tray mass, slide friction and required travel. Choose a motor/driver with suitable torque and stall-current margin. The example parts below are candidates, not a verified mechanical calculation.</p></div></>}
        {active==="parts" && <><div className="panel-kicker">03 · COMPONENTS & BOM</div><h2>What to buy and why</h2><p className="demo-lead">Indicative India retail estimates only — not live quotes. Confirm exact module variant, datasheet and current stock before purchase.</p><div className="demo-table-wrap"><table className="demo-table"><thead><tr><th>Part</th><th>Qty</th><th>Why it is needed</th><th>Est. cost</th></tr></thead><tbody>{parts.map(p=><tr key={p[0]}><td><b>{p[0]}</b><small>{p[4]}</small></td><td>{p[1]}</td><td>{p[2]}</td><td>{p[3]}</td></tr>)}</tbody></table></div><div className="demo-callout"><b>Budget expectation</b><p>Rough prototype budget: ₹2,200–₹4,700 depending on the motor, slides, fabrication and sensing method. This excludes tools and shipping.</p></div></>}
        {active==="wiring" && <><div className="panel-kicker">04 · WIRING MAP</div><h2>How the modules connect</h2><p className="demo-lead">Example ESP32 pin plan. Treat it as a starting map only: verify the exact driver/sensor board pinout and voltage before connecting.</p><div className="demo-table-wrap"><table className="demo-table"><thead><tr><th>From</th><th>To</th><th>Notes</th></tr></thead><tbody>{connections.map(c=><tr key={c[0]}><td><b>{c[0]}</b></td><td>{c[1]}</td><td>{c[2]}</td></tr>)}</tbody></table></div><div className="demo-callout warning"><b>Electrical safety</b><p>ESP32 GPIO is 3.3 V and is not 5 V tolerant. Never power the motor from the ESP32. Fuse the motor rail, use an emergency stop that disables driver power, and confirm driver stall-current ratings. No mains wiring in this beginner prototype.</p></div></>}
        {active==="firmware" && <><div className="panel-kicker">05 · FIRMWARE STARTER</div><h2>Control logic and code skeleton</h2><p className="demo-lead">The key is a state machine: one customer event causes one cycle. The code below is a structured skeleton, not a flash-ready sketch; sensor functions, pin definitions, debounce and motor-driver specifics must be implemented for your exact modules.</p><div className="demo-state-line">IDLE → EXTEND → WAIT_PICKUP → RETRACT → LOCKOUT</div><pre className="demo-code">{code}</pre><button className="primary-button" onClick={()=>{navigator.clipboard?.writeText(code);setCopied(true);}}> {copied?"Copied":"Copy code skeleton"} </button></>}
        {active==="assembly" && <><div className="panel-kicker">06 · BUILD & TEST</div><h2>Follow this build order</h2><p className="demo-lead">Tick off each stage only after it works independently. Progress is kept while this page remains open.</p><div className="demo-checklist">{stages.map((s,i)=><label key={s[0]} className={done.includes(i)?"checked":""}><input type="checkbox" checked={done.includes(i)} onChange={()=>toggle(i)}/><span><b>Stage {i+1}: {s[0]}</b><small>{s[1]}</small></span></label>)}</div><h3>Acceptance tests before a stall trial</h3><ul className="demo-tests"><li>Holding a person in front of the sensor does not trigger repeated cycles.</li><li>Tray stops at both end switches and on timeout.</li><li>Emergency stop disables motor drive immediately.</li><li>Missing plate prevents a cycle; pickup is confirmed before reset.</li><li>At least 30 consecutive cycles complete without a jam.</li></ul></>}
      </section>
    </div>
    <p className="safety-note">Engineering note: this is a learning prototype guide. Validate the mechanism, electrical ratings and firmware on a guarded bench setup before putting it near customers or food.</p>
  </main>;
}
