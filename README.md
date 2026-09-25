# DWIT — Rural Health Continuity Platform

> **Don't Worry, I'm There.**

DWIT is a digital rural healthcare coordination platform designed to connect **patients, ASHA workers, medical officers, and administrators** through a unified healthcare workflow.

The platform focuses on improving continuity of care by combining patient records, appointments, maternal and child healthcare, referrals, medical inventory, diagnostics, field visits, and operational monitoring in one system.

---

## Overview

Rural healthcare often involves multiple people and facilities working together while dealing with limited connectivity, fragmented records, and communication gaps.

DWIT provides a connected digital workflow for:

- Patient registration and healthcare access
- ASHA field-level care coordination
- Medical officer workflows
- Maternal and child healthcare tracking
- Appointment management
- Referrals between healthcare facilities
- Prescription and laboratory records
- Medicine inventory monitoring
- Diagnostic availability
- Offline-aware workflows
- QR-based healthcare workflows
- Location and map-based functionality
- Administrative monitoring across PHCs

---

# Key Features

## Patient Portal

Patients can access their healthcare information and interact with the healthcare system through a dedicated patient portal.

Features include:

- Patient profile
- Appointment booking
- Appointment history
- Prescription information
- Laboratory reports
- Referral information
- Healthcare history
- Maternal and child healthcare access where applicable

---

## ASHA Worker Portal

The ASHA workflow is designed for field-level healthcare coordination.

Features include:

- Patient search
- Patient registration
- Home visit tracking
- Maternal healthcare follow-up
- ANC tracking
- Child healthcare tracking
- Immunization tracking
- Family planning records
- Appointment coordination
- Referral creation
- Offline-aware workflows
- QR-based functionality
- Field-level patient follow-up

---

## Medical Officer Portal

Medical officers can manage healthcare workflows within their assigned facility.

Features include:

- Patient records
- Appointments
- Clinical visits
- Prescriptions
- Laboratory reports
- Referrals
- Maternal healthcare
- Child healthcare
- Patient history
- Facility-level healthcare coordination

Role-based access ensures medical officers work within their authorized healthcare facility.

---

# Admin Command Center

The platform includes a system-wide administrative dashboard for monitoring healthcare operations.

The Admin dashboard provides:

### Dashboard
- Total patients
- Active pregnancies
- Children aged 0–6
- ASHA workers
- Medical officers
- Pending referrals
- Today's appointments

### PHC Analytics
- Patient distribution by PHC
- Pregnancy statistics
- Child population statistics
- ASHA workforce
- Doctor/staff distribution
- Care-mix visualization
- Facility-level analytics

### Patient Tracking
- Patient list
- Patient ID
- Patient name
- Assigned PHC
- Search and filtering

### Medical Inventory
- Medicine stock levels
- Available medicines
- Low-stock medicines
- Out-of-stock medicines
- Minimum stock thresholds
- Facility-wise inventory monitoring

### Diagnostics
- Diagnostic availability
- Facility-level diagnostic information

### Staff & Roles
- ASHA workers
- Medical officers
- Administrative users
- Facility assignments
- Role-based access overview

### Referrals
- Referral monitoring
- Referring facility
- Destination facility
- Referral status
- Patient-linked referral information

### AI Copilot
Operational insights generated from healthcare system data, such as:

- Inventory warnings
- Referral queue observations
- Maternal continuity observations
- Operational priorities

The AI Copilot is intended as **operational decision support** and not as a replacement for qualified medical judgment.

### Audit Logs
Recent system activity generated from healthcare operations and records.

### System Health
Monitoring of important platform components and operational status.

---

# Healthcare Modules

DWIT contains workflows for multiple areas of rural healthcare.

### Maternal Healthcare
- Pregnancy registration
- ANC visits
- Maternal immunization
- Delivery records
- Postnatal visits

### Child Healthcare
- Child records
- Child immunization
- Child health visits

### Family Planning
- Family planning records
- Follow-up workflows

### Clinical Records
- Visits
- Prescriptions
- Laboratory reports
- Referrals
- Appointments

### Facility Operations
- Medicine inventory
- Diagnostic availability
- Facility-level staff
- Operational analytics

---

# Role-Based Access

DWIT uses role-based access to separate healthcare responsibilities.

| Role | Access |
|------|--------|
| Patient | Personal healthcare information and appointments |
| ASHA Worker | Field-level patient and community healthcare workflows |
| Medical Officer | Clinical and facility-level workflows |
| Administrator | System-wide healthcare and operational monitoring |

Healthcare staff are associated with authorized facilities to support facility-level access control.

---

# Technology Stack

## Frontend

- HTML
- CSS
- JavaScript
- Vite
- Leaflet
- QRCode.js
- HTML5 QR Code

## Backend

- Python
- FastAPI
- SQLite
- REST APIs

## AI

- Google Gemini / Google GenAI

## Deployment

- Vercel — Frontend
- Render — Backend

---

# Project Architecture

```text
DWIT
│
├── frontend/
│   ├── public/
│   │   └── dwit-logo.png
│   │
│   ├── src/
│   │   ├── main.js
│   │   └── style.css
│   │
│   ├── index.html
│   ├── package.json
│   └── package-lock.json
│
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── sihgpt.db
│
└── README.md
