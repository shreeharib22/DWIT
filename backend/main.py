from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import sqlite3
from datetime import datetime
import os
from google import genai
from google.genai import types

# =========================================================
# APP
# =========================================================

app = FastAPI(
    title="DWIT API",
    description="Rural Health Continuity Platform",
    version="2.0.0"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
       "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
    "http://localhost:5176",
    "http://127.0.0.1:5176",
    "http://192.168.13.157:5173",
    "http://192.168.13.157:5174",
    "http://192.168.13.157:5175",
    "http://192.168.13.157:5176",
  "https://dwit-fawn.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# DATABASE
# =========================================================

DATABASE = "sihgpt.db"


def get_db():
    connection = sqlite3.connect(DATABASE)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def table_columns(db, table_name):
    rows = db.execute(
        f"PRAGMA table_info({table_name})"
    ).fetchall()

    return {
        row["name"]
        for row in rows
    }


def add_column_if_missing(
    db,
    table_name,
    column_name,
    column_definition
):
    columns = table_columns(db, table_name)

    if column_name not in columns:
        db.execute(
            f"""
            ALTER TABLE {table_name}
            ADD COLUMN {column_name} {column_definition}
            """
        )


# =========================================================
# FACILITIES
# =========================================================

FACILITIES = [
    {
        "id": "PHC-BENGALURU-RURAL",
        "type": "PHC",
        "name": "PHC Bengaluru Rural",
    },
    {
        "id": "PHC-ANEKAL",
        "type": "PHC",
        "name": "PHC Anekal",
    },
    {
        "id": "PHC-DEVANAHALLI",
        "type": "PHC",
        "name": "PHC Devanahalli",
    },
    {
        "id": "CHC-BENGALURU-RURAL",
        "type": "CHC",
        "name": "CHC Bengaluru Rural",
    },
    {
        "id": "CHC-ANEKAL",
        "type": "CHC",
        "name": "CHC Anekal",
    },
    {
        "id": "CHC-DEVANAHALLI",
        "type": "CHC",
        "name": "CHC Devanahalli",
    },
    {
        "id": "RURAL-HOSPITAL-BENGALURU-RURAL",
        "type": "RURAL_HOSPITAL",
        "name": "Rural Hospital Bengaluru Rural",
    },
    {
        "id": "RURAL-HOSPITAL-ANEKAL",
        "type": "RURAL_HOSPITAL",
        "name": "Rural Hospital Anekal",
    },
    {
        "id": "DISTRICT-HOSPITAL-BENGALURU-RURAL",
        "type": "DISTRICT_HOSPITAL",
        "name": "District Hospital Bengaluru Rural",
    },
]

# =========================================================
# FACILITY MAP + SERVICE METADATA
# =========================================================

FACILITY_MAP_DATA = {

    "PHC-BENGALURU-RURAL": {
        "latitude": 13.2470,
        "longitude": 77.7130,
        "address": "Bengaluru Rural",
        "services": [
            "Primary Care",
            "Maternal Care",
            "Child Health",
            "Vaccination",
            "Basic Diagnostics"
        ]
    },

    "PHC-ANEKAL": {
        "latitude": 12.7110,
        "longitude": 77.6950,
        "address": "Anekal, Bengaluru Rural",
        "services": [
            "Primary Care",
            "Maternal Care",
            "Child Health",
            "Vaccination",
            "Basic Diagnostics"
        ]
    },

    "PHC-DEVANAHALLI": {
        "latitude": 13.2470,
        "longitude": 77.7130,
        "address": "Devanahalli, Bengaluru Rural",
        "services": [
            "Primary Care",
            "Maternal Care",
            "Child Health",
            "Vaccination",
            "Basic Diagnostics"
        ]
    },

    "CHC-BENGALURU-RURAL": {
        "latitude": 13.2470,
        "longitude": 77.7130,
        "address": "Bengaluru Rural",
        "services": [
            "Primary Care",
            "Emergency Care",
            "Diagnostics",
            "Pharmacy",
            "Maternal Care"
        ]
    },

    "CHC-ANEKAL": {
        "latitude": 12.7110,
        "longitude": 77.6950,
        "address": "Anekal, Bengaluru Rural",
        "services": [
            "Primary Care",
            "Emergency Care",
            "Diagnostics",
            "Pharmacy",
            "Maternal Care"
        ]
    },

    "CHC-DEVANAHALLI": {
        "latitude": 13.2470,
        "longitude": 77.7130,
        "address": "Devanahalli, Bengaluru Rural",
        "services": [
            "Primary Care",
            "Emergency Care",
            "Diagnostics",
            "Pharmacy",
            "Maternal Care"
        ]
    },

    "RURAL-HOSPITAL-BENGALURU-RURAL": {
        "latitude": 13.2470,
        "longitude": 77.7130,
        "address": "Bengaluru Rural",
        "services": [
            "Inpatient Care",
            "Emergency Care",
            "Diagnostics",
            "Pharmacy",
            "Specialist Referral"
        ]
    },

    "RURAL-HOSPITAL-ANEKAL": {
        "latitude": 12.7110,
        "longitude": 77.6950,
        "address": "Anekal, Bengaluru Rural",
        "services": [
            "Inpatient Care",
            "Emergency Care",
            "Diagnostics",
            "Pharmacy",
            "Specialist Referral"
        ]
    },

    "DISTRICT-HOSPITAL-BENGALURU-RURAL": {
        "latitude": 13.2470,
        "longitude": 77.7130,
        "address": "Bengaluru Rural",
        "services": [
            "Emergency Care",
            "Specialist Care",
            "Diagnostics",
            "Pharmacy",
            "Inpatient Care",
            "Surgery"
        ]
    }
}

# =========================================================
# DATABASE INITIALIZATION
# =========================================================

def initialize_database():

    db = get_db()
    cursor = db.cursor()

    # -----------------------------------------------------
    # FACILITIES
    # -----------------------------------------------------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS facilities (
            id TEXT PRIMARY KEY,
            facility_type TEXT NOT NULL,
            name TEXT UNIQUE NOT NULL,
            parent_id TEXT
        )
    """)

    for facility in FACILITIES:

        cursor.execute(
            """
            INSERT OR IGNORE INTO facilities (
                id,
                facility_type,
                name,
                parent_id
            )
            VALUES (?, ?, ?, ?)
            """,
            (
                facility["id"],
                facility["type"],
                facility["name"],
                None,
            )
        )

    # -----------------------------------------------------
    # USERS
    # -----------------------------------------------------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            role TEXT NOT NULL,
            facility_id TEXT,
            active INTEGER DEFAULT 1,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (facility_id)
                REFERENCES facilities(id)
        )
    """)

    # -----------------------------------------------------
    # PATIENTS
    # -----------------------------------------------------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS patients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            age INTEGER,
            gender TEXT,
            phone TEXT,
            village TEXT,
            blood_group TEXT,
            health_status TEXT
        )
    """)

    add_column_if_missing(
        db,
        "patients",
        "facility_id",
        "TEXT DEFAULT 'PHC-BENGALURU-RURAL'"
    )

    # -----------------------------------------------------
    # APPOINTMENTS
    # -----------------------------------------------------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id TEXT NOT NULL,
            doctor TEXT NOT NULL,
            facility TEXT NOT NULL,
            appointment_date TEXT NOT NULL,
            appointment_time TEXT NOT NULL,
            status TEXT DEFAULT 'Upcoming'
        )
    """)

    add_column_if_missing(
        db,
        "appointments",
        "facility_id",
        "TEXT DEFAULT 'PHC-BENGALURU-RURAL'"
    )

    # -----------------------------------------------------
    # PRESCRIPTIONS
    # -----------------------------------------------------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS prescriptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id TEXT NOT NULL,
            medicine TEXT NOT NULL,
            dosage TEXT NOT NULL,
            frequency TEXT NOT NULL,
            duration TEXT NOT NULL,
            prescribed_by TEXT NOT NULL
        )
    """)

    add_column_if_missing(
        db,
        "prescriptions",
        "facility_id",
        "TEXT DEFAULT 'PHC-BENGALURU-RURAL'"
    )

    # -----------------------------------------------------
    # LAB REPORTS
    # -----------------------------------------------------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS lab_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id TEXT NOT NULL,
            test_name TEXT NOT NULL,
            result TEXT NOT NULL,
            report_date TEXT NOT NULL,
            status TEXT DEFAULT 'Available'
        )
    """)

    add_column_if_missing(
        db,
        "lab_reports",
        "facility_id",
        "TEXT DEFAULT 'PHC-BENGALURU-RURAL'"
    )

    # -----------------------------------------------------
    # REFERRALS
    # -----------------------------------------------------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS referrals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id TEXT NOT NULL,
            referred_by TEXT NOT NULL,
            referred_to TEXT NOT NULL,
            reason TEXT NOT NULL,
            priority TEXT DEFAULT 'Normal',
            status TEXT DEFAULT 'Pending'
        )
    """)

    add_column_if_missing(
        db,
        "referrals",
        "from_facility_id",
        "TEXT DEFAULT 'PHC-BENGALURU-RURAL'"
    )

    add_column_if_missing(
        db,
        "referrals",
        "to_facility_id",
        "TEXT"
    )

    # -----------------------------------------------------
    # VISITS
    # -----------------------------------------------------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS visits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id TEXT NOT NULL,
            recorded_by TEXT NOT NULL,
            facility_id TEXT NOT NULL,
            visit_date TEXT NOT NULL,
            symptoms TEXT,
            temperature TEXT,
            blood_pressure TEXT,
            pulse TEXT,
            spo2 TEXT,
            notes TEXT,
            triage_status TEXT DEFAULT 'Normal',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # -----------------------------------------------------
    # MEDICINE INVENTORY
    # -----------------------------------------------------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS medicine_inventory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            facility_id TEXT NOT NULL,
            medicine_name TEXT NOT NULL,
            category TEXT DEFAULT 'General',
            stock_quantity INTEGER NOT NULL DEFAULT 0,
            unit TEXT DEFAULT 'units',
            minimum_stock INTEGER NOT NULL DEFAULT 10,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_by TEXT,
            UNIQUE (facility_id, medicine_name),
            FOREIGN KEY (facility_id)
                REFERENCES facilities(id)
        )
    """)

        # -----------------------------------------------------
    # DIAGNOSTIC AVAILABILITY
    # -----------------------------------------------------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS diagnostic_availability (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            facility_id TEXT NOT NULL,
            test_name TEXT NOT NULL,
            category TEXT DEFAULT 'General',
            status TEXT NOT NULL DEFAULT 'Available',
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_by TEXT,
            UNIQUE (facility_id, test_name),
            FOREIGN KEY (facility_id)
                REFERENCES facilities(id)
        )
    """)

        # -----------------------------------------------------
    # DEMO DIAGNOSTIC AVAILABILITY
    # -----------------------------------------------------

    demo_diagnostics = [
        (
            "PHC-BENGALURU-RURAL",
            "Complete Blood Count",
            "Blood Test",
            "Available"
        ),
        (
            "PHC-BENGALURU-RURAL",
            "Blood Glucose",
            "Blood Test",
            "Available"
        ),
        (
            "PHC-BENGALURU-RURAL",
            "ECG",
            "Cardiac",
            "Available"
        ),
        (
            "PHC-BENGALURU-RURAL",
            "X-Ray",
            "Imaging",
            "Unavailable"
        ),

        (
            "PHC-ANEKAL",
            "Complete Blood Count",
            "Blood Test",
            "Available"
        ),
        (
            "PHC-ANEKAL",
            "Blood Glucose",
            "Blood Test",
            "Available"
        ),
        (
            "PHC-ANEKAL",
            "X-Ray",
            "Imaging",
            "Limited"
        ),

        (
            "CHC-BENGALURU-RURAL",
            "Complete Blood Count",
            "Blood Test",
            "Available"
        ),
        (
            "CHC-BENGALURU-RURAL",
            "Blood Glucose",
            "Blood Test",
            "Available"
        ),
        (
            "CHC-BENGALURU-RURAL",
            "ECG",
            "Cardiac",
            "Available"
        ),
        (
            "CHC-BENGALURU-RURAL",
            "X-Ray",
            "Imaging",
            "Available"
        ),
        (
            "CHC-BENGALURU-RURAL",
            "Ultrasound",
            "Imaging",
            "Unavailable"
        ),
    ]

    for diagnostic in demo_diagnostics:
        cursor.execute(
            """
            INSERT OR IGNORE INTO diagnostic_availability (
                facility_id,
                test_name,
                category,
                status
            )
            VALUES (?, ?, ?, ?)
            """,
            diagnostic
        )
        # -----------------------------------------------------
    # DEMO MEDICINE STOCK
    # -----------------------------------------------------

    demo_medicines = [
        ("PHC-BENGALURU-RURAL", "Paracetamol 500mg", "General", 124, "strips", 20),
        ("PHC-BENGALURU-RURAL", "Amoxicillin 500mg", "Antibiotic", 18, "strips", 20),
        ("PHC-BENGALURU-RURAL", "ORS Sachets", "Essential", 0, "sachets", 15),
        ("PHC-BENGALURU-RURAL", "Metformin 500mg", "Diabetes", 67, "strips", 20),

        ("PHC-ANEKAL", "Paracetamol 500mg", "General", 86, "strips", 20),
        ("PHC-ANEKAL", "ORS Sachets", "Essential", 42, "sachets", 15),
        ("PHC-ANEKAL", "Amoxicillin 500mg", "Antibiotic", 7, "strips", 20),

        ("CHC-BENGALURU-RURAL", "Paracetamol 500mg", "General", 240, "strips", 30),
        ("CHC-BENGALURU-RURAL", "Amoxicillin 500mg", "Antibiotic", 95, "strips", 20),
        ("CHC-BENGALURU-RURAL", "ORS Sachets", "Essential", 180, "sachets", 30),
        ("CHC-BENGALURU-RURAL", "Metformin 500mg", "Diabetes", 112, "strips", 20),
        ("CHC-BENGALURU-RURAL", "Azithromycin 250mg", "Antibiotic", 9, "strips", 20),
    ]

    for medicine in demo_medicines:
        cursor.execute(
            """
            INSERT OR IGNORE INTO medicine_inventory (
                facility_id,
                medicine_name,
                category,
                stock_quantity,
                unit,
                minimum_stock
            )
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            medicine
        )


    # =====================================================
    # MIGRATE EXISTING DATA
    # =====================================================

    cursor.execute("""
        UPDATE patients
        SET facility_id = 'PHC-BENGALURU-RURAL'
        WHERE facility_id IS NULL
           OR TRIM(facility_id) = ''
    """)

    cursor.execute("""
        UPDATE appointments
        SET facility_id = 'PHC-BENGALURU-RURAL'
        WHERE facility_id IS NULL
           OR TRIM(facility_id) = ''
    """)

    cursor.execute("""
        UPDATE prescriptions
        SET facility_id = 'PHC-BENGALURU-RURAL'
        WHERE facility_id IS NULL
           OR TRIM(facility_id) = ''
    """)

    cursor.execute("""
        UPDATE lab_reports
        SET facility_id = 'PHC-BENGALURU-RURAL'
        WHERE facility_id IS NULL
           OR TRIM(facility_id) = ''
    """)

    cursor.execute("""
        UPDATE referrals
        SET from_facility_id = 'PHC-BENGALURU-RURAL'
        WHERE from_facility_id IS NULL
           OR TRIM(from_facility_id) = ''
    """)

    cursor.execute("""
        UPDATE referrals
        SET to_facility_id =
            'DISTRICT-HOSPITAL-BENGALURU-RURAL'
        WHERE referred_to = 'District Hospital Bengaluru Rural'
          AND (
              to_facility_id IS NULL
              OR TRIM(to_facility_id) = ''
          )
    """)

    # =====================================================
    # DEMO PATIENT
    # =====================================================

    patient = cursor.execute(
        """
        SELECT *
        FROM patients
        WHERE patient_id = ?
        """,
        ("PAT001",)
    ).fetchone()

    if not patient:

        cursor.execute(
            """
            INSERT INTO patients (
                patient_id,
                name,
                age,
                gender,
                phone,
                village,
                blood_group,
                health_status,
                facility_id
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                "PAT001",
                "Demo Patient",
                28,
                "Female",
                "+91 98765 43210",
                "Bengaluru Rural",
                "B+",
                "Stable",
                "PHC-BENGALURU-RURAL",
            )
        )

    # =====================================================
    # DEMO APPOINTMENT
    # =====================================================

    appointment_exists = cursor.execute(
        """
        SELECT id
        FROM appointments
        WHERE patient_id = 'PAT001'
        LIMIT 1
        """
    ).fetchone()

    if not appointment_exists:

        cursor.execute(
            """
            INSERT INTO appointments (
                patient_id,
                doctor,
                facility,
                appointment_date,
                appointment_time,
                status,
                facility_id
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                "PAT001",
                "Dr. Demo Officer",
                "PHC Bengaluru Rural",
                "18 September 2026",
                "10:30 AM",
                "Upcoming",
                "PHC-BENGALURU-RURAL",
            )
        )

    # =====================================================
    # DEMO PRESCRIPTIONS
    # =====================================================

    prescription_exists = cursor.execute(
        """
        SELECT id
        FROM prescriptions
        WHERE patient_id = 'PAT001'
        LIMIT 1
        """
    ).fetchone()

    if not prescription_exists:

        cursor.execute(
            """
            INSERT INTO prescriptions (
                patient_id,
                medicine,
                dosage,
                frequency,
                duration,
                prescribed_by,
                facility_id
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                "PAT001",
                "Paracetamol",
                "500 mg",
                "Twice daily",
                "5 days",
                "Dr. Demo Officer",
                "PHC-BENGALURU-RURAL",
            )
        )

        cursor.execute(
            """
            INSERT INTO prescriptions (
                patient_id,
                medicine,
                dosage,
                frequency,
                duration,
                prescribed_by,
                facility_id
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                "PAT001",
                "Vitamin D",
                "1000 IU",
                "Once daily",
                "30 days",
                "Dr. Demo Officer",
                "PHC-BENGALURU-RURAL",
            )
        )

    # =====================================================
    # DEMO LAB REPORTS
    # =====================================================

    lab_exists = cursor.execute(
        """
        SELECT id
        FROM lab_reports
        WHERE patient_id = 'PAT001'
        LIMIT 1
        """
    ).fetchone()

    if not lab_exists:

        cursor.execute(
            """
            INSERT INTO lab_reports (
                patient_id,
                test_name,
                result,
                report_date,
                status,
                facility_id
            )
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                "PAT001",
                "Complete Blood Count",
                "Normal",
                "05 September 2026",
                "Available",
                "PHC-BENGALURU-RURAL",
            )
        )

        cursor.execute(
            """
            INSERT INTO lab_reports (
                patient_id,
                test_name,
                result,
                report_date,
                status,
                facility_id
            )
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                "PAT001",
                "Blood Glucose",
                "Normal",
                "05 September 2026",
                "Available",
                "PHC-BENGALURU-RURAL",
            )
        )

    # =====================================================
    # DEMO REFERRAL
    # =====================================================

    referral_exists = cursor.execute(
        """
        SELECT id
        FROM referrals
        WHERE patient_id = 'PAT001'
        LIMIT 1
        """
    ).fetchone()

    if not referral_exists:

        cursor.execute(
            """
            INSERT INTO referrals (
                patient_id,
                referred_by,
                referred_to,
                reason,
                priority,
                status,
                from_facility_id,
                to_facility_id
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                "PAT001",
                "PHC Bengaluru Rural",
                "District Hospital Bengaluru Rural",
                "Specialist consultation",
                "Normal",
                "Completed",
                "PHC-BENGALURU-RURAL",
                "DISTRICT-HOSPITAL-BENGALURU-RURAL",
            )
        )

    # =====================================================
    # DEMO USERS
    # =====================================================

    demo_users = [
        (
            "ASHA001",
            "Demo ASHA Worker",
            "asha",
            "PHC-BENGALURU-RURAL",
        ),
        (
            "DOCTOR001",
            "Dr. Demo Medical Officer",
            "doctor",
            "PHC-BENGALURU-RURAL",
        ),
        (
            "DOC001",
            "Dr. Demo Medical Officer",
            "doctor",
            "PHC-BENGALURU-RURAL",
        ),
        (
            "ASHA002",
            "Asha Anekal",
            "asha",
            "PHC-ANEKAL",
        ),
        (
            "DOCTOR002",
            "Dr. Anekal Officer",
            "doctor",
            "PHC-ANEKAL",
        ),
        (
            "ASHA003",
            "Asha Devanahalli",
            "asha",
            "PHC-DEVANAHALLI",
        ),
        (
            "DOCTOR003",
            "Dr. Devanahalli Officer",
            "doctor",
            "PHC-DEVANAHALLI",
        ),
    ]

    for user in demo_users:

        cursor.execute(
            """
            INSERT OR IGNORE INTO users (
                user_id,
                name,
                role,
                facility_id,
                active
            )
            VALUES (?, ?, ?, ?, 1)
            """,
            user
        )

    # -----------------------------------------------------
    # APPOINTMENT / DOCTOR AVAILABILITY EXTENSIONS
    # -----------------------------------------------------

    cursor.execute("DROP TABLE IF EXISTS doctor_availability")

    cursor.execute("""
        CREATE TABLE doctor_availability (
            doctor_user_id TEXT PRIMARY KEY,
            status TEXT NOT NULL DEFAULT 'Available',
            specialty TEXT NOT NULL DEFAULT 'General Medicine',
            working_days TEXT NOT NULL DEFAULT 'Mon,Tue,Wed,Thu,Fri',
            start_time TEXT NOT NULL DEFAULT '09:00',
            end_time TEXT NOT NULL DEFAULT '17:00',
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (doctor_user_id) REFERENCES users(user_id)
        )
    """)

    add_column_if_missing(db, "appointments", "doctor_user_id", "TEXT")
    add_column_if_missing(db, "appointments", "reason", "TEXT DEFAULT ''")
    add_column_if_missing(db, "appointments", "booked_by", "TEXT")
    add_column_if_missing(db, "appointments", "source_role", "TEXT")
    add_column_if_missing(db, "appointments", "created_at", "TEXT")
    add_column_if_missing(db, "appointments", "updated_at", "TEXT")

    cursor.execute("""
        UPDATE appointments
        SET created_at = COALESCE(created_at, CURRENT_TIMESTAMP),
            updated_at = COALESCE(updated_at, CURRENT_TIMESTAMP)
        WHERE created_at IS NULL OR updated_at IS NULL
    """)

    cursor.execute("""
        UPDATE appointments
        SET doctor_user_id = 'DOCTOR001'
        WHERE doctor_user_id IS NULL OR TRIM(doctor_user_id) = ''
    """)

    cursor.execute("""
        INSERT OR IGNORE INTO doctor_availability
            (doctor_user_id, status, specialty, working_days, start_time, end_time)
        SELECT
            u.user_id,
            'Available',
            CASE
                WHEN LOWER(u.name) LIKE '%surge%' THEN 'General Surgery'
                WHEN LOWER(u.name) LIKE '%child%' THEN 'Paediatrics'
                ELSE 'General Medicine'
            END,
            'Mon,Tue,Wed,Thu,Fri',
            '09:00',
            '17:00'
        FROM users u
        WHERE u.role = 'doctor' AND u.active = 1
    """)

    db.commit()
    db.close()

# Initialize database when application starts.
initialize_database()


# =========================================================
# MODELS
# =========================================================

class LoginRequest(BaseModel):
    role: str
    user_id: str
    facility_type: str = ""
    facility: str = ""


class PatientRegistration(BaseModel):
    patient_id: str
    name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    village: Optional[str] = None
    blood_group: Optional[str] = None
    health_status: str = "Stable"
    facility_id: str

class ASHANewPatientCreate(BaseModel):
    name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    village: Optional[str] = None
    blood_group: Optional[str] = None
    health_status: str = "Stable"

class VisitCreate(BaseModel):
    patient_id: str
    symptoms: str = ""
    temperature: str = ""
    blood_pressure: str = ""
    pulse: str = ""
    spo2: str = ""
    notes: str = ""
    triage_status: str = "Normal"

class AIAssessmentRequest(BaseModel):
    patient_id: str
    symptoms: str = ""
    temperature: str = ""
    blood_pressure: str = ""
    pulse: str = ""
    spo2: str = ""
    notes: str = ""
class PatientVoiceExplanationRequest(BaseModel):
    patient_id: str
    symptoms: str
    language: str = "en"


class ReferralCreate(BaseModel):
    patient_id: str
    to_facility_id: str
    reason: str
    priority: str = "Normal"

class DoctorConsultationCreate(BaseModel):
    patient_id: str
    diagnosis: str = ""
    consultation_notes: str = ""
    medicine: str = ""
    dosage: str = ""
    frequency: str = ""
    duration: str = ""
    follow_up: str = ""


class DoctorPrescriptionCreate(BaseModel):
    patient_id: str
    medicine: str
    dosage: str
    frequency: str
    duration: str


class AppointmentCreate(BaseModel):
    patient_id: str
    doctor_user_id: str
    appointment_date: str
    appointment_time: str
    reason: str = ""


class AppointmentUpdate(BaseModel):
    appointment_date: Optional[str] = None
    appointment_time: Optional[str] = None
    status: Optional[str] = None
    reason: Optional[str] = None


class DoctorAvailabilityUpdate(BaseModel):
    status: str = "Available"
    specialty: str = "General Medicine"
    working_days: str = "Mon,Tue,Wed,Thu,Fri"
    start_time: str = "09:00"
    end_time: str = "17:00"



# =========================================================
# HELPERS
# =========================================================

def normalize_role(role: str) -> str:

    role = role.strip().lower()

    aliases = {
        "officer": "doctor",
        "medical_officer": "doctor",
        "medical officer": "doctor",
        "doctor": "doctor",
        "asha_worker": "asha",
        "asha worker": "asha",
        "asha": "asha",
        "patient": "patient",
    }

    return aliases.get(role, role)


def get_facility(
    db,
    facility_id: str
):

    return db.execute(
        """
        SELECT *
        FROM facilities
        WHERE id = ?
        """,
        (facility_id,)
    ).fetchone()


def get_facility_by_name(
    db,
    facility_name: str
):

    return db.execute(
        """
        SELECT *
        FROM facilities
        WHERE name = ?
        """,
        (facility_name.strip(),)
    ).fetchone()


def get_user(
    db,
    user_id: str
):

    return db.execute(
        """
        SELECT
            u.*,
            f.name AS facility_name,
            f.facility_type
        FROM users u
        LEFT JOIN facilities f
            ON f.id = u.facility_id
        WHERE u.user_id = ?
          AND u.active = 1
        """,
        (user_id.strip(),)
    ).fetchone()


def get_patient(
    db,
    patient_id: str
):

    return db.execute(
        """
        SELECT
            p.*,
            f.name AS facility_name,
            f.facility_type
        FROM patients p
        LEFT JOIN facilities f
            ON f.id = p.facility_id
        WHERE p.patient_id = ?
        """,
        (patient_id.strip(),)
    ).fetchone()


def staff_can_access_patient(
    db,
    user_id: str,
    patient_id: str
):

    user = get_user(
        db,
        user_id
    )

    patient = get_patient(
        db,
        patient_id
    )

    if not user:
        return False, "Authorized staff user not found"

    if user["role"] not in [
        "asha",
        "doctor",
    ]:
        return False, "Only staff users can access this resource"

    if not patient:
        return False, "Patient not found"

    # Patient belongs to the same facility.
    if user["facility_id"] == patient["facility_id"]:
        return True, "same_facility"

    # Patient has an active referral to this facility.
    referral = db.execute(
        """
        SELECT id
        FROM referrals
        WHERE patient_id = ?
          AND to_facility_id = ?
          AND status IN (
              'Pending',
              'Accepted',
              'In Progress',
              'Completed'
          )
        LIMIT 1
        """,
        (
            patient_id,
            user["facility_id"],
        )
    ).fetchone()

    if referral:
        return True, "legitimate_referral"

    return False, "Patient belongs to another facility"

# =========================================================
# AI-ASSISTED SMART TRIAGE
# =========================================================

def build_ai_assessment(
    symptoms: str = "",
    temperature: str = "",
    blood_pressure: str = "",
    pulse: str = "",
    spo2: str = "",
    notes: str = ""
):
    text = " ".join([
        symptoms or "",
        notes or ""
    ]).strip().lower()

    reasons = []
    priority = "Routine"

    # Oxygen saturation
    try:
        spo2_value = float(spo2)
        if spo2_value < 90:
            priority = "Urgent"
            reasons.append(
                "Oxygen saturation is below the configured urgent threshold."
            )
        elif spo2_value < 94:
            if priority != "Urgent":
                priority = "Review"
            reasons.append(
                "Oxygen saturation is below the configured review threshold."
            )
    except (TypeError, ValueError):
        pass

    # Temperature
    try:
        temp_value = float(
            str(temperature)
            .replace("°", "")
            .replace("C", "")
            .replace("c", "")
        )

        if temp_value >= 39.0:
            if priority != "Urgent":
                priority = "Review"
            reasons.append(
                "Temperature is elevated and needs clinical review."
            )
    except (TypeError, ValueError):
        pass

    # Pulse
    try:
        pulse_value = float(pulse)

        if pulse_value >= 120 or pulse_value <= 45:
            priority = "Urgent"
            reasons.append(
                "Pulse is outside the configured urgent range."
            )
        elif pulse_value >= 100:
            if priority != "Urgent":
                priority = "Review"
            reasons.append(
                "Pulse is elevated and should be reviewed."
            )
    except (TypeError, ValueError):
        pass

    # Blood pressure
    try:
        bp_parts = str(blood_pressure).replace(" ", "").split("/")

        if len(bp_parts) == 2:
            systolic = float(bp_parts[0])
            diastolic = float(bp_parts[1])

            if systolic >= 180 or diastolic >= 120:
                priority = "Urgent"
                reasons.append(
                    "Blood pressure is in the configured urgent range."
                )
            elif systolic >= 140 or diastolic >= 90:
                if priority != "Urgent":
                    priority = "Review"
                reasons.append(
                    "Blood pressure is elevated and needs review."
                )
    except (TypeError, ValueError):
        pass

    # Symptom-based escalation flags.
    urgent_terms = [
        "severe chest pain",
        "difficulty breathing",
        "shortness of breath",
        "unconscious",
        "fainted",
        "seizure",
        "heavy bleeding",
        "severe bleeding",
        "stroke",
        "cannot breathe"
    ]

    review_terms = [
        "persistent fever",
        "vomiting",
        "diarrhea",
        "dizziness",
        "weakness",
        "swelling",
        "persistent cough",
        "infection"
    ]

    matched_urgent = [
        term for term in urgent_terms
        if term in text
    ]

    matched_review = [
        term for term in review_terms
        if term in text
    ]

    if matched_urgent:
        priority = "Urgent"

        reasons.append(
            "The recorded symptoms contain an urgent escalation indicator."
        )

    elif matched_review and priority != "Urgent":
        priority = "Review"

        reasons.append(
            "The recorded symptoms contain an indicator for clinical review."
        )

    # Default explanation.
    if not reasons:
        reasons.append(
            "No configured urgent or review indicators were detected "
            "from the available information."
        )

    if priority == "Urgent":
        next_action = (
            "Escalate for prompt clinical assessment and human review."
        )
        care_level = "Urgent clinical care"
        human_review = True

    elif priority == "Review":
        next_action = (
            "Arrange clinical review and verify the recorded observations."
        )
        care_level = "Primary care / clinician review"
        human_review = True

    else:
        next_action = (
            "Continue routine care, monitor symptoms, and follow the "
            "existing care plan."
        )
        care_level = "Routine community care"
        human_review = False

    return {
        "priority": priority,
        "explanation": reasons,
        "next_action": next_action,
        "care_level": care_level,
        "human_review_required": human_review,
        "decision_support": True,
        "disclaimer": (
            "Decision-support only. This assessment does not provide "
            "an autonomous diagnosis or treatment recommendation."
        )
    }

@app.post("/ai/assessment")
async def ai_assessment(
    data: AIAssessmentRequest
):
    db = get_db()

    patient = get_patient(
        db,
        data.patient_id
    )

    if not patient:
        db.close()
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    api_key = os.getenv("GEMINI_API_KEY")

    # Safe fallback when Gemini is unavailable
    if not api_key:
        result = build_ai_assessment(
            symptoms=data.symptoms,
            temperature=data.temperature,
            blood_pressure=data.blood_pressure,
            pulse=data.pulse,
            spo2=data.spo2,
            notes=data.notes
        )

        db.close()

        return {
            "success": True,
            "patient_id": data.patient_id,
            "patient_name": patient["name"],
            "ai_provider": "rules_fallback",
            "assessment": result
        }

    try:
        client = genai.Client(
            api_key=api_key
        )

        prompt = f"""
You are an AI clinical decision-support assistant
inside DWIT, a rural health continuity platform.

You assist trained health workers by organizing and
assessing the information they recorded during a field visit.

You MUST NOT:
- diagnose the patient
- prescribe medication
- claim certainty
- invent missing information
- make autonomous treatment decisions

Use ONLY the information provided below.
CRITICAL FACTUAL RULES:
- Treat every supplied vital sign as an exact recorded fact.
- Never change, round, estimate, or replace a recorded value.
- Never invent a measurement that is not provided.
- Do not repeat vital numbers in the explanation.
- Refer to measurements using neutral phrases such as "temperature is elevated"
  or "pulse is elevated" when explaining the result.
- Base the assessment only on the supplied patient information.

PATIENT
Name: {patient["name"]}
Age: {patient["age"]}
Gender: {patient["gender"]}

FIELD VISIT
Symptoms: {data.symptoms}
Temperature: {data.temperature}
Blood pressure: {data.blood_pressure}
Pulse: {data.pulse}
SpO2: {data.spo2}
ASHA notes: {data.notes}

Return ONLY valid JSON with these fields:

{{
  "priority": "Routine | Review | Urgent",
  "explanation": [
    "1 to 4 concise reasons based only on the provided information"
  ],
  "next_action": "A concise next step for the human health worker",
  "care_level": "Routine community care | Primary care / clinician review | Urgent clinical care",
  "human_review_required": true,
  "decision_support": true,
  "disclaimer": "Decision-support only. This assessment does not provide an autonomous diagnosis or treatment recommendation."
}}

Rules:
- Routine = no clear configured concern requiring escalation.
- Review = information should be reviewed by a clinician.
- Urgent = concerning information needs prompt human assessment.
- Do not provide a diagnosis.
- Do not prescribe medicines.
- Do not invent values that were not supplied.
"""

        response = client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )

        import json

        assessment = json.loads(
            response.text
        )

        db.close()

        return {
            "success": True,
            "patient_id": data.patient_id,
            "patient_name": patient["name"],
            "ai_provider": "Google Gemini",
            "model": "gemini-3.5-flash-lite",
            "assessment": assessment
        }

    except Exception as error:
        print(
            "Gemini AI assessment failed:",
            error
        )

        print(
    "GEMINI ERROR TYPE:",
    type(error).__name__
)

        print(
    "GEMINI ERROR DETAILS:",
    str(error)
)

        # Safe fallback if Gemini fails
        result = build_ai_assessment(
            symptoms=data.symptoms,
            temperature=data.temperature,
            blood_pressure=data.blood_pressure,
            pulse=data.pulse,
            spo2=data.spo2,
            notes=data.notes
        )

        db.close()

        return {
            "success": True,
            "patient_id": data.patient_id,
            "patient_name": patient["name"],
            "ai_provider": "rules_fallback",
            "assessment": result
        }

# =========================================================
# PATIENT VOICE SYMPTOM EXPLANATION
# =========================================================

@app.post("/ai/patient-explanation")
async def patient_voice_explanation(
    data: PatientVoiceExplanationRequest
):
    db = get_db()

    patient = get_patient(
        db,
        data.patient_id
    )

    if not patient:
        db.close()
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    symptoms = data.symptoms.strip()

    if not symptoms:
        db.close()
        raise HTTPException(
            status_code=400,
            detail="No symptoms were provided."
        )

    # Get the latest recorded visit for additional context.
    latest_visit = db.execute(
        """
        SELECT
            symptoms,
            temperature,
            blood_pressure,
            pulse,
            spo2,
            notes,
            triage_status,
            visit_date
        FROM visits
        WHERE patient_id = ?
        ORDER BY id DESC
        LIMIT 1
        """,
        (data.patient_id,)
    ).fetchone()

    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        db.close()

        return {
            "success": True,
            "ai_provider": "basic_fallback",
            "language": data.language,
            "patient_id": data.patient_id,
            "summary": symptoms,
            "explanation": (
                "Your symptoms have been recorded. "
                "Please discuss them with your healthcare worker "
                "for proper medical assessment."
            ),
            "next_steps": (
                "Follow the advice given by your healthcare worker."
            ),
            "warning": (
                "If your condition becomes severe or you feel unsafe, "
                "seek urgent medical care."
            )
        }

    try:
        client = genai.Client(
            api_key=api_key
        )

        language_names = {
            "en": "English",
            "hi": "Hindi",
            "kn": "Kannada",
            "mr": "Marathi",
            "ta": "Tamil",
            "te": "Telugu",
            "ml": "Malayalam",
            "bn": "Bengali",
            "gu": "Gujarati",
            "pa": "Punjabi",
            "as": "Assamese"
        }

        language_name = language_names.get(
            data.language,
            "English"
        )

        visit_context = ""

        if latest_visit:
            visit_context = f"""
LATEST RECORDED VISIT

Symptoms:
{latest_visit["symptoms"] or "Not recorded"}

Temperature:
{latest_visit["temperature"] or "Not recorded"}

Blood pressure:
{latest_visit["blood_pressure"] or "Not recorded"}

Pulse:
{latest_visit["pulse"] or "Not recorded"}

SpO2:
{latest_visit["spo2"] or "Not recorded"}

Health worker notes:
{latest_visit["notes"] or "Not recorded"}

Triage status:
{latest_visit["triage_status"] or "Not recorded"}
"""

        prompt = f"""
You are the patient communication assistant inside DWIT
(Do not worry, I'm there), a rural healthcare continuity platform.

Your job is to explain the patient's recorded health information
in simple, reassuring language.

The patient has selected:
{language_name}

IMPORTANT:

- Do NOT diagnose the patient.
- Do NOT claim certainty.
- Do NOT prescribe medicines.
- Do NOT invent symptoms, test results or measurements.
- Do NOT tell the patient that they definitely have a disease.
- Clearly distinguish symptoms from a medical diagnosis.
- Use very simple language suitable for a patient with limited
  medical knowledge.
- Explain what the reported symptoms may indicate only in general terms.
- Encourage consultation with a healthcare professional.
- If warning signs are present, tell the patient to seek prompt
  medical attention.
- Return the response entirely in {language_name}.

PATIENT

Name:
{patient["name"]}

Age:
{patient["age"]}

Gender:
{patient["gender"]}

PATIENT'S SPOKEN SYMPTOMS

{symptoms}

{visit_context}

Return ONLY valid JSON with exactly these fields:

{{
    "summary": "A short summary of what the patient reported.",
    "explanation": "A simple patient-friendly explanation.",
    "next_steps": "What the patient should do next.",
    "warning": "Important warning signs or when to seek medical help."
}}

Do not include markdown.
"""

        response = client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )

        import json

        result = json.loads(
            response.text
        )

        db.close()

        return {
            "success": True,
            "ai_provider": "Google Gemini",
            "model": "gemini-3.5-flash-lite",
            "patient_id": data.patient_id,
            "language": data.language,
            "language_name": language_name,
            "summary": result.get(
                "summary",
                ""
            ),
            "explanation": result.get(
                "explanation",
                ""
            ),
            "next_steps": result.get(
                "next_steps",
                ""
            ),
            "warning": result.get(
                "warning",
                ""
            )
        }

    except Exception as error:

        print(
            "Patient explanation AI failed:",
            error
        )

        db.close()

        return {
            "success": True,
            "ai_provider": "fallback",
            "patient_id": data.patient_id,
            "language": data.language,
            "summary": symptoms,
            "explanation": (
                "Your symptoms have been recorded. "
                "Please discuss them with your healthcare worker."
            ),
            "next_steps": (
                "Follow the instructions provided by your healthcare worker."
            ),
            "warning": (
                "If you feel seriously unwell, seek medical attention promptly."
            )
        }
# =========================================================
# BASIC ROUTES
# =========================================================
# =========================================================
# MEDICINE INVENTORY API
# =========================================================

@app.get("/inventory")
async def get_inventory(
    facility_id: Optional[str] = None
):
    db = get_db()

    if facility_id:
        rows = db.execute(
            """
            SELECT
                mi.id,
                mi.facility_id,
                f.name AS facility_name,
                mi.medicine_name,
                mi.category,
                mi.stock_quantity,
                mi.unit,
                mi.minimum_stock,
                mi.updated_at,
                mi.updated_by
            FROM medicine_inventory mi
            LEFT JOIN facilities f
                ON f.id = mi.facility_id
            WHERE mi.facility_id = ?
            ORDER BY mi.medicine_name
            """,
            (facility_id,)
        ).fetchall()
    else:
        rows = db.execute(
            """
            SELECT
                mi.id,
                mi.facility_id,
                f.name AS facility_name,
                mi.medicine_name,
                mi.category,
                mi.stock_quantity,
                mi.unit,
                mi.minimum_stock,
                mi.updated_at,
                mi.updated_by
            FROM medicine_inventory mi
            LEFT JOIN facilities f
                ON f.id = mi.facility_id
            ORDER BY f.name, mi.medicine_name
            """
        ).fetchall()

    db.close()

    inventory = []

    for row in rows:
        item = dict(row)

        if item["stock_quantity"] <= 0:
            item["status"] = "Out of Stock"
        elif item["stock_quantity"] < item["minimum_stock"]:
            item["status"] = "Low Stock"
        else:
            item["status"] = "Available"

        inventory.append(item)

    return {
        "success": True,
        "inventory": inventory
    }

# =========================================================
# DIAGNOSTIC AVAILABILITY API
# =========================================================

@app.get("/diagnostics")
async def get_diagnostics(
    facility_id: Optional[str] = None
):
    db = get_db()

    if facility_id:
        rows = db.execute(
            """
            SELECT
                da.id,
                da.facility_id,
                f.name AS facility_name,
                da.test_name,
                da.category,
                da.status,
                da.updated_at,
                da.updated_by
            FROM diagnostic_availability da
            LEFT JOIN facilities f
                ON f.id = da.facility_id
            WHERE da.facility_id = ?
            ORDER BY da.test_name
            """,
            (facility_id,)
        ).fetchall()
    else:
        rows = db.execute(
            """
            SELECT
                da.id,
                da.facility_id,
                f.name AS facility_name,
                da.test_name,
                da.category,
                da.status,
                da.updated_at,
                da.updated_by
            FROM diagnostic_availability da
            LEFT JOIN facilities f
                ON f.id = da.facility_id
            ORDER BY f.name, da.test_name
            """
        ).fetchall()

    db.close()

    return {
        "success": True,
        "diagnostics": [
            dict(row)
            for row in rows
        ]
    }




@app.get("/")
async def root():

    return {
        "status": "ok",
        "service": "DWIT API",
        "version": "2.0.0",
        "message": "Backend is running",
    }


@app.get("/health")
async def health_check():

    return {
        "status": "healthy",
        "database": "connected",
    }


# =========================================================
# FACILITIES
# =========================================================

@app.get("/facilities")
async def list_facilities():

    db = get_db()

    rows = db.execute(
        """
        SELECT
            id,
            facility_type,
            name,
            parent_id
        FROM facilities
        ORDER BY facility_type, name
        """
    ).fetchall()

    db.close()

    return {
    "success": True,
    "facilities": [
        {
            **dict(row),
            **FACILITY_MAP_DATA.get(
                row["id"],
                {}
            )
        }
        for row in rows
    ],
}


@app.get("/facilities/{facility_id}")
async def get_facility_details(
    facility_id: str
):

    db = get_db()

    facility = get_facility(
        db,
        facility_id
    )

    db.close()

    if not facility:

        raise HTTPException(
            status_code=404,
            detail="Facility not found"
        )

    return {
        "success": True,
        "facility": dict(facility),
    }




# =========================================================
# LOGIN
# =========================================================

@app.post("/login")
async def login(
    data: LoginRequest
):

    user_id = data.user_id.strip()
    role = normalize_role(data.role)

    if not user_id:

        return {
            "success": False,
            "message": "User ID is required",
        }

    if role not in [
        "patient",
        "asha",
        "doctor",
    ]:

        return {
            "success": False,
            "message": "Invalid role",
        }

    db = get_db()

    # -----------------------------------------------------
    # PATIENT
    # -----------------------------------------------------

    if role == "patient":

        patient = get_patient(
            db,
            user_id
        )

        db.close()

        if not patient:

            return {
                "success": False,
                "message": "Patient ID not found",
            }

        return {
            "success": True,
            "message": "Patient authentication successful",
            "user": {
                "user_id": patient["patient_id"],
                "role": "patient",
                "name": patient["name"],
                "facility_id": patient["facility_id"],
                "facility": patient["facility_name"],
                "facility_type": patient["facility_type"],
            },
        }

    # -----------------------------------------------------
    # STAFF
    # -----------------------------------------------------

    user = get_user(
        db,
        user_id
    )

    if not user:

        db.close()

        return {
            "success": False,
            "message": "User ID not found",
        }

    if user["role"] != role:

        db.close()

        return {
            "success": False,
            "message":
                "This user is not authorized "
                "for the selected role",
        }

    if not data.facility_type:

        db.close()

        return {
            "success": False,
            "message": "Facility type is required",
        }

    if not data.facility:

        db.close()

        return {
            "success": False,
            "message": "Facility is required",
        }

    selected_facility = get_facility_by_name(
        db,
        data.facility
    )

    if not selected_facility:

        db.close()

        return {
            "success": False,
            "message": "Selected facility does not exist",
        }

    # Staff may only log in to their assigned facility.
    if selected_facility["id"] != user["facility_id"]:

        db.close()

        return {
            "success": False,
            "message":
                "Access denied: this account is assigned to "
                f"{user['facility_name']}",
        }

    # Facility type must match as well.
    if (
        selected_facility["facility_type"].upper()
        != data.facility_type.strip().upper()
    ):

        db.close()

        return {
            "success": False,
            "message":
                "Facility type does not match "
                "assigned facility",
        }

    response = {
        "success": True,
        "message": "Authentication successful",
        "user": {
            "user_id": user["user_id"],
            "name": user["name"],
            "role": user["role"],
            "facility_id": user["facility_id"],
            "facility": user["facility_name"],
            "facility_type": user["facility_type"],
        },
    }

    db.close()

    return response


# =========================================================
# USER DETAILS
# =========================================================

@app.get("/users/{user_id}")
async def get_user_details(
    user_id: str
):

    db = get_db()

    user = get_user(
        db,
        user_id
    )

    db.close()

    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return {
        "success": True,
        "user": {
            "user_id": user["user_id"],
            "name": user["name"],
            "role": user["role"],
            "facility_id": user["facility_id"],
            "facility": user["facility_name"],
            "facility_type": user["facility_type"],
        },
    }


# =========================================================
# PATIENT REGISTRATION
# =========================================================

@app.post("/patients")
async def register_patient(
    data: PatientRegistration,
    created_by: str
):

    db = get_db()

    staff = get_user(
        db,
        created_by
    )

    if not staff:

        db.close()

        raise HTTPException(
            status_code=403,
            detail="Authorized staff user not found"
        )

    if staff["role"] not in [
        "asha",
        "doctor",
    ]:

        db.close()

        raise HTTPException(
            status_code=403,
            detail=
                "Only ASHA workers and doctors "
                "can register patients"
        )

    if data.facility_id != staff["facility_id"]:

        db.close()

        raise HTTPException(
            status_code=403,
            detail=
                "You can only register patients "
                "for your assigned facility"
        )

    facility = get_facility(
        db,
        data.facility_id
    )

    if not facility:

        db.close()

        raise HTTPException(
            status_code=400,
            detail="Invalid facility"
        )

    try:

        db.execute(
            """
            INSERT INTO patients (
                patient_id,
                name,
                age,
                gender,
                phone,
                village,
                blood_group,
                health_status,
                facility_id
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                data.patient_id.strip(),
                data.name.strip(),
                data.age,
                data.gender,
                data.phone,
                data.village,
                data.blood_group,
                data.health_status,
                data.facility_id,
            )
        )

        db.commit()

    except sqlite3.IntegrityError:

        db.close()

        raise HTTPException(
            status_code=409,
            detail="Patient ID already exists"
        )

    patient = get_patient(
        db,
        data.patient_id
    )

    db.close()

    return {
        "success": True,
        "message": "Patient registered successfully",
        "patient": dict(patient),
    }

# =========================================================
# ASHA - REGISTER NEW PATIENT WITH AUTO ID
# =========================================================

@app.post("/staff/{user_id}/patients/register")
async def register_new_patient_by_asha(
    user_id: str,
    data: ASHANewPatientCreate
):
    db = get_db()

    staff = get_user(
        db,
        user_id
    )

    if not staff:
        db.close()
        raise HTTPException(
            status_code=403,
            detail="Authorized staff user not found"
        )

    if staff["role"] != "asha":
        db.close()
        raise HTTPException(
            status_code=403,
            detail="Only ASHA workers can register new patients"
        )

    facility_id = staff["facility_id"]

    if not facility_id:
        db.close()
        raise HTTPException(
            status_code=400,
            detail="ASHA worker is not assigned to a facility"
        )

    # Find the highest existing PAT### number
    row = db.execute(
        """
        SELECT MAX(
            CAST(SUBSTR(patient_id, 4) AS INTEGER)
        ) AS max_num
        FROM patients
        WHERE patient_id LIKE 'PAT%'
        """
    ).fetchone()

    max_num = row["max_num"] or 0

    patient_id = f"PAT{max_num + 1:03d}"

    try:
        db.execute(
            """
            INSERT INTO patients (
                patient_id,
                name,
                age,
                gender,
                phone,
                village,
                blood_group,
                health_status,
                facility_id
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                patient_id,
                data.name.strip(),
                data.age,
                data.gender,
                data.phone,
                data.village,
                data.blood_group,
                data.health_status,
                facility_id
            )
        )

        db.commit()

    except sqlite3.IntegrityError:
        db.close()

        raise HTTPException(
            status_code=409,
            detail="Generated patient ID already exists. Please try again."
        )

    patient = get_patient(
        db,
        patient_id
    )

    db.close()

    return {
        "success": True,
        "message": "New patient registered successfully",
        "patient": dict(patient),
    }


# =========================================================
# PATIENT PROFILE
# =========================================================

@app.get("/patients/{patient_id}")
async def get_patient_profile(
    patient_id: str
):

    db = get_db()

    patient = get_patient(
        db,
        patient_id
    )

    db.close()

    if not patient:

        return {
            "success": False,
            "message": "Patient not found",
        }

    return {
        "success": True,
        "patient": dict(patient),
    }

# =========================================================
# CAREPASS - CONTINUITY-AWARE PATIENT PASSPORT
# =========================================================

@app.get("/patients/{patient_id}/carepass")
async def get_patient_carepass(patient_id: str):
    db = get_db()

    patient = get_patient(db, patient_id)

    if not patient:
        db.close()
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )
    patient_data = dict(patient)

    # -----------------------------------------------------
    # VISITS
    # -----------------------------------------------------
    visits = db.execute(
        """
        SELECT
            v.*,
            u.name AS recorder_name
        FROM visits v
        LEFT JOIN users u
            ON u.user_id = v.recorded_by
        WHERE v.patient_id = ?
        ORDER BY v.visit_date DESC, v.id DESC
        """,
        (patient_id,)
    ).fetchall()

    visits = [dict(row) for row in visits]

    # -----------------------------------------------------
    # REFERRALS
    # -----------------------------------------------------
    referrals = db.execute(
        """
        SELECT *
        FROM referrals
        WHERE patient_id = ?
        ORDER BY rowid DESC
        """,
        (patient_id,)
    ).fetchall()

    referrals = [dict(row) for row in referrals]

    # -----------------------------------------------------
    # APPOINTMENTS
    # -----------------------------------------------------
    appointments = db.execute(
        """
        SELECT *
        FROM appointments
        WHERE patient_id = ?
        ORDER BY appointment_date DESC, appointment_time DESC
        """,
        (patient_id,)
    ).fetchall()

    appointments = [dict(row) for row in appointments]

    db.close()

    # -----------------------------------------------------
    # CURRENT STATUS
    # -----------------------------------------------------
    health_status = patient_data.get(
        "health_status",
        "Stable"
    )

    last_visit = visits[0] if visits else None

    # -----------------------------------------------------
    # OPEN REFERRALS
    # -----------------------------------------------------
    closed_referral_statuses = {
        "Completed",
        "Closed",
        "Cancelled"
    }

    open_referrals = [
        referral
        for referral in referrals
        if str(
            referral.get("status", "")
        ) not in closed_referral_statuses
    ]

    # -----------------------------------------------------
    # UPCOMING / ACTIVE APPOINTMENTS
    # -----------------------------------------------------
    active_appointment_statuses = {
        "Requested",
        "Confirmed"
    }

    active_appointments = [
        appointment
        for appointment in appointments
        if str(
            appointment.get("status", "")
        ) in active_appointment_statuses
    ]

    # -----------------------------------------------------
    # CARE JOURNEY
    # -----------------------------------------------------
    journey = []

    for visit in reversed(visits):
        journey.append(
            {
                "type": "visit",
                "title": "Field Visit",
                "date": visit.get("visit_date"),
                "status": visit.get(
                    "triage_status",
                    "Normal"
                ),
                "facility_id": visit.get(
                    "facility_id"
                ),
                "recorded_by": visit.get(
                    "recorder_name"
                ),
                "notes": visit.get("notes", "")
            }
        )

    for referral in referrals:
        journey.append(
            {
                "type": "referral",
                "title": "Referral",
                "date": referral.get(
                    "created_at"
                ),
                "status": referral.get(
                    "status",
                    "Pending"
                ),
                "from_facility": referral.get(
                    "from_facility_id"
                ),
                "to_facility": referral.get(
                    "to_facility_id"
                ),
                "reason": referral.get(
                    "reason",
                    ""
                ),
                "priority": referral.get(
                    "priority",
                    "Normal"
                )
            }
        )

    for appointment in appointments:
        journey.append(
            {
                "type": "appointment",
                "title": "Appointment",
                "date": appointment.get(
                    "appointment_date"
                ),
                "time": appointment.get(
                    "appointment_time"
                ),
                "status": appointment.get(
                    "status",
                    "Requested"
                ),
                "doctor": appointment.get(
                    "doctor"
                ),
                "facility": appointment.get(
                    "facility"
                ),
                "reason": appointment.get(
                    "reason",
                    ""
                )
            }
        )

    # -----------------------------------------------------
    # OPEN ITEMS
    # -----------------------------------------------------
    open_items = []

    for referral in open_referrals:
        open_items.append(
            {
                "type": "referral",
                "title": "Referral needs follow-up",
                "detail": referral.get(
                    "reason",
                    "Referral is still open"
                ),
                "priority": referral.get(
                    "priority",
                    "Normal"
                )
            }
        )

    for appointment in active_appointments:
        open_items.append(
            {
                "type": "appointment",
                "title": "Upcoming appointment",
                "detail": (
                    f"{appointment.get('appointment_date', '')} "
                    f"{appointment.get('appointment_time', '')}"
                ),
                "priority": "Normal"
            }
        )

    if health_status in {
        "Needs Review",
        "Urgent"
    }:
        open_items.append(
            {
                "type": "health_status",
                "title": "Health status requires attention",
                "detail": health_status,
                "priority": (
                    "High"
                    if health_status == "Urgent"
                    else "Medium"
                )
            }
        )

    # -----------------------------------------------------
    # NEXT ACTION
    # -----------------------------------------------------
    if health_status == "Urgent":
        next_action = {
            "title": "Urgent clinical review",
            "detail": (
                "Patient should be reviewed by "
                "the appropriate healthcare professional."
            ),
            "priority": "Urgent"
        }

    elif open_referrals:
        next_action = {
            "title": "Complete referral journey",
            "detail": (
                "Follow the active referral and "
                "confirm receiving-facility care."
            ),
            "priority": "High"
        }

    elif active_appointments:
        next_action = {
            "title": "Attend next appointment",
            "detail": (
                f"{active_appointments[0].get('appointment_date', '')} "
                f"{active_appointments[0].get('appointment_time', '')}"
            ),
            "priority": "Normal"
        }

    elif visits:
        next_action = {
            "title": "Continue routine follow-up",
            "detail": (
                "Review the patient's latest visit "
                "and maintain continuity of care."
            ),
            "priority": "Normal"
        }

    else:
        next_action = {
            "title": "Begin patient care journey",
            "detail": (
                "No previous care activity is available."
            ),
            "priority": "Normal"
        }

    # -----------------------------------------------------
    # HANDOVER BRIEF
    # -----------------------------------------------------
    handover_parts = []

    handover_parts.append(
        f"Patient {patient_data.get('name', patient_id)} "
        f"is currently marked as {health_status}."
    )

    if last_visit:
        handover_parts.append(
            "The latest recorded field visit "
            f"was on {last_visit.get('visit_date', 'unknown date')}."
        )

        if last_visit.get("triage_status"):
            handover_parts.append(
                "Latest triage status: "
                f"{last_visit.get('triage_status')}."
            )

    if open_referrals:
        handover_parts.append(
            f"There are {len(open_referrals)} "
            "open referral(s) requiring follow-up."
        )

    if active_appointments:
        handover_parts.append(
            f"There are {len(active_appointments)} "
            "active appointment(s)."
        )

    handover_parts.append(
        "Next care action: "
        f"{next_action['title']}."
    )

    handover_brief = " ".join(handover_parts)

    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------
    return {
        "success": True,
        "carepass": {
            "patient": dict(patient),

            "current_status": {
                "health_status": health_status,
                "last_visit": last_visit
            },

            "care_journey": journey,

            "open_items": open_items,

            "open_referrals": open_referrals,

            "active_appointments": active_appointments,

            "next_action": next_action,

            "handover_brief": handover_brief
        }
    }
# =========================================================
# STAFF PATIENT LIST
# =========================================================

@app.get("/staff/{user_id}/patients")
async def get_staff_patients(
    user_id: str
):

    db = get_db()

    user = get_user(
        db,
        user_id
    )

    if not user:

        db.close()

        raise HTTPException(
            status_code=403,
            detail="Authorized user not found"
        )

    if user["role"] not in [
        "asha",
        "doctor",
    ]:

        db.close()

        raise HTTPException(
            status_code=403,
            detail=
                "Only ASHA workers and doctors "
                "can access staff patient lists"
        )

    own_patients = db.execute(
        """
        SELECT
            p.*,
            f.name AS facility_name,
            f.facility_type
        FROM patients p
        LEFT JOIN facilities f
            ON f.id = p.facility_id
        WHERE p.facility_id = ?
        """,
        (
            user["facility_id"],
        )
    ).fetchall()

    referred_patients = db.execute(
        """
        SELECT DISTINCT
            p.*,
            f.name AS facility_name,
            f.facility_type
        FROM patients p
        JOIN referrals r
            ON r.patient_id = p.patient_id
        LEFT JOIN facilities f
            ON f.id = p.facility_id
        WHERE r.to_facility_id = ?
          AND r.status IN (
              'Pending',
              'Accepted',
              'In Progress',
              'Completed'
          )
        """,
        (
            user["facility_id"],
        )
    ).fetchall()

    patient_map = {}

    for patient in own_patients:
        patient_map[
            patient["patient_id"]
        ] = dict(patient)

    for patient in referred_patients:
        patient_map[
            patient["patient_id"]
        ] = dict(patient)

    db.close()

    patients = list(
        patient_map.values()
    )

    patients.sort(
        key=lambda item: (
            item.get("name") or ""
        ).lower()
    )

    return {
        "success": True,
        "facility": user["facility_name"],
        "facility_id": user["facility_id"],
        "patients": patients,
    }


# =========================================================
# STAFF SINGLE PATIENT
# =========================================================

@app.get("/staff/{user_id}/patients/{patient_id}")
async def get_staff_patient(
    user_id: str,
    patient_id: str
):

    db = get_db()

    allowed, reason = staff_can_access_patient(
        db,
        user_id,
        patient_id
    )

    if not allowed:

        db.close()

        raise HTTPException(
            status_code=403,
            detail=reason
        )

    patient = get_patient(
        db,
        patient_id
    )

    db.close()

    return {
        "success": True,
        "access_reason": reason,
        "patient": dict(patient),
    }


# =========================================================
# ACCESS CHECK
# =========================================================

@app.get("/access-check/{user_id}/{patient_id}")
async def access_check(
    user_id: str,
    patient_id: str
):

    db = get_db()

    allowed, reason = staff_can_access_patient(
        db,
        user_id,
        patient_id
    )

    db.close()

    return {
        "success": True,
        "allowed": allowed,
        "reason": reason,
    }


# =========================================================
# APPOINTMENTS
# =========================================================

@app.get("/patients/{patient_id}/appointments")
async def get_appointments(
    patient_id: str
):

    db = get_db()

    appointments = db.execute(
        """
        SELECT *
        FROM appointments
        WHERE patient_id = ?
        ORDER BY id DESC
        """,
        (
            patient_id,
        )
    ).fetchall()

    db.close()

    return {
        "success": True,
        "appointments": [
            dict(appointment)
            for appointment in appointments
        ],
    }


# =========================================================
# APPOINTMENT MANAGEMENT + DOCTOR AVAILABILITY
# =========================================================

@app.get("/doctors")
async def list_doctors(facility_id: Optional[str] = None):
    db = get_db()
    params = []
    query = """
        SELECT
            u.user_id,
            u.name,
            u.facility_id,
            f.name AS facility_name,
            COALESCE(da.status, 'Available') AS availability_status,
            COALESCE(da.specialty, 'General Medicine') AS specialty,
            COALESCE(da.working_days, 'Mon,Tue,Wed,Thu,Fri') AS working_days,
            COALESCE(da.start_time, '09:00') AS start_time,
            COALESCE(da.end_time, '17:00') AS end_time
        FROM users u
        LEFT JOIN facilities f ON f.id = u.facility_id
        LEFT JOIN doctor_availability da ON da.doctor_user_id = u.user_id
        WHERE u.role = 'doctor' AND u.active = 1
    """
    if facility_id:
        query += " AND u.facility_id = ?"
        params.append(facility_id)
    query += " ORDER BY u.name"
    rows = db.execute(query, params).fetchall()
    db.close()
    return {"success": True, "doctors": [dict(row) for row in rows]}


@app.get("/doctors/{doctor_user_id}/availability")
async def get_doctor_availability(doctor_user_id: str):
    db = get_db()
    doctor = get_user(db, doctor_user_id)
    if not doctor or doctor["role"] != "doctor":
        db.close()
        raise HTTPException(status_code=404, detail="Doctor not found")
    row = db.execute("SELECT * FROM doctor_availability WHERE doctor_user_id = ?", (doctor_user_id,)).fetchone()
    if not row:
        db.execute("""
            INSERT INTO doctor_availability (doctor_user_id)
            VALUES (?)
        """, (doctor_user_id,))
        db.commit()
        row = db.execute("SELECT * FROM doctor_availability WHERE doctor_user_id = ?", (doctor_user_id,)).fetchone()
    db.close()
    return {"success": True, "availability": dict(row)}


@app.put("/doctors/{doctor_user_id}/availability")
async def update_doctor_availability(doctor_user_id: str, data: DoctorAvailabilityUpdate):
    db = get_db()
    doctor = get_user(db, doctor_user_id)
    if not doctor or doctor["role"] != "doctor":
        db.close()
        raise HTTPException(status_code=404, detail="Doctor not found")

    allowed = {"Available", "Busy", "Unavailable", "On Leave", "Emergency Only"}
    if data.status not in allowed:
        db.close()
        raise HTTPException(status_code=400, detail="Invalid availability status")

    now = datetime.now().isoformat(timespec="seconds")
    db.execute("""
        INSERT INTO doctor_availability
            (doctor_user_id, status, specialty, working_days, start_time, end_time, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(doctor_user_id) DO UPDATE SET
            status = excluded.status,
            specialty = excluded.specialty,
            working_days = excluded.working_days,
            start_time = excluded.start_time,
            end_time = excluded.end_time,
            updated_at = excluded.updated_at
    """, (
        doctor_user_id,
        data.status,
        data.specialty.strip() or "General Medicine",
        data.working_days.strip() or "Mon,Tue,Wed,Thu,Fri",
        data.start_time,
        data.end_time,
        now,
    ))
    db.commit()
    row = db.execute("SELECT * FROM doctor_availability WHERE doctor_user_id = ?", (doctor_user_id,)).fetchone()
    db.close()
    return {"success": True, "availability": dict(row)}


@app.get("/staff/{user_id}/appointments")
async def staff_appointments(user_id: str, status: Optional[str] = None):
    db = get_db()
    user = get_user(db, user_id)
    if not user or user["role"] not in {"asha", "doctor"}:
        db.close()
        raise HTTPException(status_code=403, detail="Staff access required")

    query = """
        SELECT
            a.*,
            p.name AS patient_name,
            p.village AS patient_village,
            u.name AS doctor_name,
            f.name AS facility_name
        FROM appointments a
        JOIN patients p ON p.patient_id = a.patient_id
        LEFT JOIN users u ON u.user_id = a.doctor_user_id
        LEFT JOIN facilities f ON f.id = a.facility_id
        WHERE 1=1
    """
    params = []
    if user["role"] == "doctor":
        query += " AND (a.doctor_user_id = ? OR a.doctor = ?)"
        params.extend([user_id, user["name"]])
    else:
        query += " AND p.facility_id = ?"
        params.append(user["facility_id"])
    if status:
        query += " AND a.status = ?"
        params.append(status)
    query += " ORDER BY a.appointment_date ASC, a.appointment_time ASC, a.id DESC"
    rows = db.execute(query, params).fetchall()
    db.close()
    return {"success": True, "appointments": [dict(row) for row in rows]}


@app.post("/appointments")
async def create_appointment(
    data: AppointmentCreate,
    booked_by: str,
    source_role: str = "patient"
):
    db = get_db()

    patient = get_patient(
        db,
        data.patient_id
    )

    doctor = get_user(
        db,
        data.doctor_user_id
    )

    if not patient:
        db.close()
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    if not doctor or doctor["role"] != "doctor":
        db.close()
        raise HTTPException(
            status_code=404,
            detail="Doctor not found"
        )

    # Staff booking authorization.
    if source_role in {"asha", "doctor"}:

        booker = get_user(
            db,
            booked_by
        )

        if not booker or booker["role"] not in {
            "asha",
            "doctor"
        }:
            db.close()
            raise HTTPException(
                status_code=403,
                detail="Authorized staff required"
            )

        allowed, reason = staff_can_access_patient(
            db,
            booked_by,
            data.patient_id
        )

        if not allowed:
            db.close()
            raise HTTPException(
                status_code=403,
                detail=reason
            )

    # Check doctor's availability.
    availability = db.execute(
        """
        SELECT *
        FROM doctor_availability
        WHERE doctor_user_id = ?
        """,
        (
            data.doctor_user_id,
        )
    ).fetchone()

    if availability:
        if availability["status"] not in {
            "Available"
        }:
            db.close()
            raise HTTPException(
                status_code=409,
                detail=f"Doctor is {availability['status']}"
            )

    # Prevent double booking.
    conflict = db.execute(
        """
        SELECT id
        FROM appointments
        WHERE doctor_user_id = ?
          AND appointment_date = ?
          AND appointment_time = ?
          AND status NOT IN (
              'Cancelled',
              'No-show'
          )
        LIMIT 1
        """,
        (
            data.doctor_user_id,
            data.appointment_date,
            data.appointment_time
        )
    ).fetchone()

    if conflict:
        db.close()
        raise HTTPException(
            status_code=409,
            detail="That appointment slot is already booked"
        )

    now = datetime.now().isoformat(
        timespec="seconds"
    )

    # Patient requests require doctor confirmation.
    # Staff-created appointments are immediately confirmed.
    status = (
        "Requested"
        if source_role == "patient"
        else "Confirmed"
    )

    cursor = db.execute(
        """
        INSERT INTO appointments (
            patient_id,
            doctor,
            facility,
            appointment_date,
            appointment_time,
            status,
            facility_id,
            doctor_user_id,
            reason,
            booked_by,
            source_role,
            created_at,
            updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            data.patient_id,
            doctor["name"],
            doctor["facility_name"]
                or doctor["facility_id"],
            data.appointment_date,
            data.appointment_time,
            status,
            doctor["facility_id"],
            doctor["user_id"],
            data.reason.strip(),
            booked_by,
            source_role,
            now,
            now
        )
    )

    db.commit()

    appointment = db.execute(
        """
        SELECT *
        FROM appointments
        WHERE id = ?
        """,
        (
            cursor.lastrowid,
        )
    ).fetchone()

    db.close()

    return {
        "success": True,
        "message": "Appointment requested successfully"
            if source_role == "patient"
            else "Appointment booked successfully",
        "appointment": dict(appointment)
    }
@app.patch("/appointments/{appointment_id}")
async def update_appointment(
    appointment_id: int,
    booked_by: str,
    data: AppointmentUpdate
):
    db = get_db()

    row = db.execute(
        "SELECT * FROM appointments WHERE id = ?",
        (appointment_id,)
    ).fetchone()

    if not row:
        db.close()
        raise HTTPException(
            status_code=404,
            detail="Appointment not found"
        )

    actor = get_user(db, booked_by)
    patient = get_patient(db, row["patient_id"])

    # Patients authenticate using their patient_id.
    is_patient = (
        patient is not None
        and booked_by.strip() == row["patient_id"]
    )

    if is_patient:
        actor_role = "patient"
    elif actor and actor["role"] in {"asha", "doctor"}:
        actor_role = actor["role"]
    else:
        db.close()
        raise HTTPException(
            status_code=403,
            detail="Authorized user required"
        )

    # Staff access check.
    if actor_role in {"asha", "doctor"}:
        allowed, reason = staff_can_access_patient(
            db,
            booked_by,
            row["patient_id"]
        )

        if not allowed and actor_role != "doctor":
            db.close()
            raise HTTPException(
                status_code=403,
                detail=reason
            )

    new_date = (
        data.appointment_date
        if data.appointment_date
        else row["appointment_date"]
    )

    new_time = (
        data.appointment_time
        if data.appointment_time
        else row["appointment_time"]
    )

    new_status = (
        data.status
        if data.status
        else row["status"]
    )

    new_reason = (
        data.reason
        if data.reason is not None
        else row["reason"]
    )

    # Prevent double-booking when rescheduling.
    if (
        new_date != row["appointment_date"]
        or new_time != row["appointment_time"]
    ) and row["doctor_user_id"]:

        conflict = db.execute(
            """
            SELECT id
            FROM appointments
            WHERE doctor_user_id = ?
              AND appointment_date = ?
              AND appointment_time = ?
              AND id <> ?
              AND status NOT IN ('Cancelled', 'No-show')
            LIMIT 1
            """,
            (
                row["doctor_user_id"],
                new_date,
                new_time,
                appointment_id
            )
        ).fetchone()

        if conflict:
            db.close()
            raise HTTPException(
                status_code=409,
                detail="That appointment slot is already booked"
            )

    now = datetime.now().isoformat(
        timespec="seconds"
    )

    db.execute(
        """
        UPDATE appointments
        SET appointment_date = ?,
            appointment_time = ?,
            status = ?,
            reason = ?,
            updated_at = ?
        WHERE id = ?
        """,
        (
            new_date,
            new_time,
            new_status,
            new_reason,
            now,
            appointment_id
        )
    )

    db.commit()

    updated = db.execute(
        """
        SELECT *
        FROM appointments
        WHERE id = ?
        """,
        (appointment_id,)
    ).fetchone()

    db.close()

    return {
        "success": True,
        "appointment": dict(updated)
    }



# =========================================================
# PRESCRIPTIONS
# =========================================================

@app.get("/patients/{patient_id}/prescriptions")
async def get_prescriptions(
    patient_id: str
):

    db = get_db()

    prescriptions = db.execute(
        """
        SELECT *
        FROM prescriptions
        WHERE patient_id = ?
        ORDER BY id DESC
        """,
        (
            patient_id,
        )
    ).fetchall()

    db.close()

    return {
        "success": True,
        "prescriptions": [
            dict(prescription)
            for prescription in prescriptions
        ],
    }


# =========================================================
# LAB REPORTS
# =========================================================

@app.get("/patients/{patient_id}/labs")
async def get_lab_reports(
    patient_id: str
):

    db = get_db()

    reports = db.execute(
        """
        SELECT *
        FROM lab_reports
        WHERE patient_id = ?
        ORDER BY id DESC
        """,
        (
            patient_id,
        )
    ).fetchall()

    db.close()

    return {
        "success": True,
        "labs": [
            dict(report)
            for report in reports
        ],
    }


# =========================================================
# REFERRALS
# =========================================================

@app.get("/patients/{patient_id}/referrals")
async def get_referrals(
    patient_id: str
):

    db = get_db()

    referrals = db.execute(
        """
        SELECT
            r.*,
            ff.name AS from_facility_name,
            tf.name AS to_facility_name
        FROM referrals r
        LEFT JOIN facilities ff
            ON ff.id = r.from_facility_id
        LEFT JOIN facilities tf
            ON tf.id = r.to_facility_id
        WHERE r.patient_id = ?
        ORDER BY r.id DESC
        """,
        (
            patient_id,
        )
    ).fetchall()

    db.close()

    return {
        "success": True,
        "referrals": [
            dict(referral)
            for referral in referrals
        ],
    }


# =========================================================
# ASHA - CREATE VISIT
# =========================================================

@app.post("/staff/{user_id}/visits")
async def create_visit(
    user_id: str,
    data: VisitCreate
):

    db = get_db()

    user = get_user(
        db,
        user_id
    )

    if not user:

        db.close()

        raise HTTPException(
            status_code=403,
            detail="Authorized staff user not found"
        )

    if user["role"] != "asha":

        db.close()

        raise HTTPException(
            status_code=403,
            detail=
                "Only ASHA workers can "
                "record field visits"
        )

    allowed, reason = staff_can_access_patient(
        db,
        user_id,
        data.patient_id
    )

    if not allowed:

        db.close()

        raise HTTPException(
            status_code=403,
            detail=reason
        )

    visit_date = datetime.now().strftime(
        "%d %B %Y"
    )

    cursor = db.cursor()

    cursor.execute(
        """
        INSERT INTO visits (
            patient_id,
            recorded_by,
            facility_id,
            visit_date,
            symptoms,
            temperature,
            blood_pressure,
            pulse,
            spo2,
            notes,
            triage_status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            data.patient_id,
            user_id,
            user["facility_id"],
            visit_date,
            data.symptoms.strip(),
            data.temperature.strip(),
            data.blood_pressure.strip(),
            data.pulse.strip(),
            data.spo2.strip(),
            data.notes.strip(),
            data.triage_status.strip(),
        )
    )

    visit_id = cursor.lastrowid

    status_map = {
        "Normal": "Stable",
        "Review": "Needs Review",
        "Urgent": "Urgent",
    }

    new_status = status_map.get(
        data.triage_status.strip(),
        "Stable"
    )

    cursor.execute(
        """
        UPDATE patients
        SET health_status = ?
        WHERE patient_id = ?
        """,
        (
            new_status,
            data.patient_id,
        )
    )

    db.commit()

    visit = db.execute(
        """
        SELECT
            v.*,
            u.name AS recorder_name,
            p.name AS patient_name
        FROM visits v
        LEFT JOIN users u
            ON u.user_id = v.recorded_by
        LEFT JOIN patients p
            ON p.patient_id = v.patient_id
        WHERE v.id = ?
        """,
        (
            visit_id,
        )
    ).fetchone()

    db.close()

    return {
        "success": True,
        "message": "Field visit recorded successfully",
        "visit": dict(visit),
    }


# =========================================================
# DOCTOR - SAVE CONSULTATION
# =========================================================

@app.post(
    "/doctor/{user_id}/patients/{patient_id}/consultation"
)
async def save_doctor_consultation(
    user_id: str,
    patient_id: str,
    data: DoctorConsultationCreate
):

    db = get_db()

    user = get_user(
        db,
        user_id
    )

    if not user or user["role"] != "doctor":

        db.close()

        raise HTTPException(
            status_code=403,
            detail="Doctor access required"
        )

    if (
        data.patient_id.strip()
        != patient_id.strip()
    ):

        db.close()

        raise HTTPException(
            status_code=400,
            detail="Patient ID mismatch"
        )

    allowed, reason = staff_can_access_patient(
        db,
        user_id,
        patient_id
    )

    if not allowed:

        db.close()

        raise HTTPException(
            status_code=403,
            detail=reason
        )

    diagnosis = data.diagnosis.strip()
    consultation_notes = data.consultation_notes.strip()
    follow_up = data.follow_up.strip()

    if (
        not diagnosis
        and not consultation_notes
    ):

        db.close()

        raise HTTPException(
            status_code=400,
            detail="Diagnosis or consultation notes are required"
        )

    notes = "\n".join([
        "Doctor Consultation",
        f"Diagnosis: {diagnosis or 'Not recorded'}",
        f"Consultation Notes: {consultation_notes or 'Not recorded'}",
        f"Follow-up: {follow_up or 'Not specified'}"
    ])

    cursor = db.cursor()

    cursor.execute(
        """
        INSERT INTO visits (
            patient_id,
            recorded_by,
            facility_id,
            visit_date,
            symptoms,
            temperature,
            blood_pressure,
            pulse,
            spo2,
            notes,
            triage_status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            patient_id.strip(),
            user_id,
            user["facility_id"],
            datetime.now().strftime("%d %B %Y"),
            "",
            "",
            "",
            "",
            "",
            notes,
            "Doctor Consultation"
        )
    )

    visit_id = cursor.lastrowid

    db.execute(
        """
        UPDATE patients
        SET health_status = 'Stable'
        WHERE patient_id = ?
        """,
        (
            patient_id.strip(),
        )
    )

    db.commit()

    visit = db.execute(
        """
        SELECT
            v.*,
            u.name AS recorder_name
        FROM visits v
        LEFT JOIN users u
            ON u.user_id = v.recorded_by
        WHERE v.id = ?
        """,
        (
            visit_id,
        )
    ).fetchone()

    db.close()

    return {
        "success": True,
        "message": "Doctor consultation saved successfully",
        "visit": dict(visit)
    }


# =========================================================
# DOCTOR - SAVE PRESCRIPTION
# =========================================================

@app.post(
    "/doctor/{user_id}/patients/{patient_id}/prescription"
)
async def save_doctor_prescription(
    user_id: str,
    patient_id: str,
    data: DoctorPrescriptionCreate
):

    db = get_db()

    user = get_user(
        db,
        user_id
    )

    if not user or user["role"] != "doctor":

        db.close()

        raise HTTPException(
            status_code=403,
            detail="Doctor access required"
        )

    if (
        data.patient_id.strip()
        != patient_id.strip()
    ):

        db.close()

        raise HTTPException(
            status_code=400,
            detail="Patient ID mismatch"
        )

    allowed, reason = staff_can_access_patient(
        db,
        user_id,
        patient_id
    )

    if not allowed:

        db.close()

        raise HTTPException(
            status_code=403,
            detail=reason
        )

    medicine = data.medicine.strip()
    dosage = data.dosage.strip()
    frequency = data.frequency.strip()
    duration = data.duration.strip()

    if not all([
        medicine,
        dosage,
        frequency,
        duration
    ]):

        db.close()

        raise HTTPException(
            status_code=400,
            detail="Medicine, dosage, frequency, and duration are required"
        )

    cursor = db.cursor()

    cursor.execute(
        """
        INSERT INTO prescriptions (
            patient_id,
            medicine,
            dosage,
            frequency,
            duration,
            prescribed_by,
            facility_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            patient_id.strip(),
            medicine,
            dosage,
            frequency,
            duration,
            user["name"],
            user["facility_id"]
        )
    )

    prescription_id = cursor.lastrowid

    db.commit()

    prescription = db.execute(
        """
        SELECT *
        FROM prescriptions
        WHERE id = ?
        """,
        (
            prescription_id,
        )
    ).fetchone()

    db.close()

    return {
        "success": True,
        "message": "Prescription saved successfully",
        "prescription": dict(prescription)
    }




# =========================================================
# STAFF - VIEW PATIENT VISITS
# =========================================================

@app.get(
    "/staff/{user_id}/patients/{patient_id}/visits"
)
async def get_staff_patient_visits(
    user_id: str,
    patient_id: str
):

    db = get_db()

    user = get_user(
        db,
        user_id
    )

    if not user:

        db.close()

        raise HTTPException(
            status_code=403,
            detail="Authorized user not found"
        )

    if user["role"] not in [
        "asha",
        "doctor",
    ]:

        db.close()

        raise HTTPException(
            status_code=403,
            detail=
                "Only authorized staff can "
                "view visits"
        )

    allowed, reason = staff_can_access_patient(
        db,
        user_id,
        patient_id
    )

    if not allowed:

        db.close()

        raise HTTPException(
            status_code=403,
            detail=reason
        )

    visits = db.execute(
        """
        SELECT
            v.*,
            u.name AS recorder_name
        FROM visits v
        LEFT JOIN users u
            ON u.user_id = v.recorded_by
        WHERE v.patient_id = ?
        ORDER BY v.id DESC
        """,
        (
            patient_id,
        )
    ).fetchall()

    db.close()

    return {
        "success": True,
        "patient_id": patient_id,
        "visits": [
            dict(visit)
            for visit in visits
        ],
    }


# =========================================================
# ASHA - MY FACILITY VISITS
# =========================================================

@app.get("/staff/{user_id}/visits")
async def get_staff_visits(
    user_id: str
):

    db = get_db()

    user = get_user(
        db,
        user_id
    )

    if not user:

        db.close()

        raise HTTPException(
            status_code=403,
            detail="Authorized user not found"
        )

    if user["role"] != "asha":

        db.close()

        raise HTTPException(
            status_code=403,
            detail=
                "Only ASHA workers can "
                "use this endpoint"
        )

    visits = db.execute(
        """
        SELECT
            v.*,
            p.name AS patient_name
        FROM visits v
        JOIN patients p
            ON p.patient_id = v.patient_id
        WHERE v.facility_id = ?
        ORDER BY v.id DESC
        """,
        (
            user["facility_id"],
        )
    ).fetchall()

    db.close()

    return {
        "success": True,
        "facility": user["facility_name"],
        "visits": [
            dict(visit)
            for visit in visits
        ],
    }


# =========================================================
# ASHA - CREATE REFERRAL
# =========================================================

@app.post("/staff/{user_id}/referrals")
async def create_referral(
    user_id: str,
    data: ReferralCreate
):

    db = get_db()

    user = get_user(
        db,
        user_id
    )

    if not user:

        db.close()

        raise HTTPException(
            status_code=403,
            detail="Authorized user not found"
        )

    if user["role"] != "asha":

        db.close()

        raise HTTPException(
            status_code=403,
            detail=
                "Only ASHA workers can "
                "create referrals"
        )

    allowed, reason = staff_can_access_patient(
        db,
        user_id,
        data.patient_id
    )

    if not allowed:

        db.close()

        raise HTTPException(
            status_code=403,
            detail=reason
        )

    destination = get_facility(
        db,
        data.to_facility_id
    )

    if not destination:

        db.close()

        raise HTTPException(
            status_code=404,
            detail="Destination facility not found"
        )

    if data.to_facility_id == user["facility_id"]:

        db.close()

        raise HTTPException(
            status_code=400,
            detail=
                "Patient is already at "
                "this facility"
        )

    reason_text = data.reason.strip()

    if not reason_text:

        db.close()

        raise HTTPException(
            status_code=400,
            detail="Referral reason is required"
        )

    priority = data.priority.strip()

    if priority not in [
        "Normal",
        "High",
        "Urgent",
    ]:
        priority = "Normal"

    cursor = db.cursor()

    cursor.execute(
        """
        INSERT INTO referrals (
            patient_id,
            referred_by,
            referred_to,
            reason,
            priority,
            status,
            from_facility_id,
            to_facility_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            data.patient_id,
            user["facility_name"],
            destination["name"],
            reason_text,
            priority,
            "Pending",
            user["facility_id"],
            data.to_facility_id,
        )
    )

    referral_id = cursor.lastrowid

    cursor.execute(
        """
        UPDATE patients
        SET health_status = 'Needs Review'
        WHERE patient_id = ?
        """,
        (
            data.patient_id,
        )
    )

    db.commit()

    referral = db.execute(
        """
        SELECT
            r.*,
            ff.name AS from_facility_name,
            tf.name AS to_facility_name
        FROM referrals r
        LEFT JOIN facilities ff
            ON ff.id = r.from_facility_id
        LEFT JOIN facilities tf
            ON tf.id = r.to_facility_id
        WHERE r.id = ?
        """,
        (
            referral_id,
        )
    ).fetchone()

    db.close()

    return {
        "success": True,
        "message": "Referral created successfully",
        "referral": dict(referral),
    }


# =========================================================
# DOCTOR - REFERRAL QUEUE
# =========================================================

@app.get("/staff/{user_id}/referrals")
async def get_staff_referrals(
    user_id: str
):

    db = get_db()

    user = get_user(
        db,
        user_id
    )

    if not user:

        db.close()

        raise HTTPException(
            status_code=403,
            detail="Authorized user not found"
        )

    if user["role"] != "doctor":

        db.close()

        raise HTTPException(
            status_code=403,
            detail=
                "Only medical officers can "
                "view the referral queue"
        )

    referrals = db.execute(
        """
        SELECT
            r.*,
            p.name AS patient_name,
            p.age AS patient_age,
            p.gender AS patient_gender,
            p.village AS patient_village,
            ff.name AS from_facility_name,
            tf.name AS to_facility_name
        FROM referrals r
        JOIN patients p
            ON p.patient_id = r.patient_id
        LEFT JOIN facilities ff
            ON ff.id = r.from_facility_id
        LEFT JOIN facilities tf
            ON tf.id = r.to_facility_id
        WHERE r.to_facility_id = ?
        ORDER BY
            CASE r.priority
                WHEN 'Urgent' THEN 1
                WHEN 'High' THEN 2
                ELSE 3
            END,
            r.id DESC
        """,
        (
            user["facility_id"],
        )
    ).fetchall()

    db.close()

    return {
        "success": True,
        "facility": user["facility_name"],
        "referrals": [
            dict(referral)
            for referral in referrals
        ],
    }


# =========================================================
# DOCTOR - UPDATE REFERRAL STATUS
# =========================================================

@app.post(
    "/staff/{user_id}/referrals/{referral_id}/status"
)
async def update_referral_status(
    user_id: str,
    referral_id: int,
    status: str
):

    db = get_db()

    user = get_user(
        db,
        user_id
    )

    if not user or user["role"] != "doctor":

        db.close()

        raise HTTPException(
            status_code=403,
            detail=
                "Only authorized medical officers "
                "can update referrals"
        )

    referral = db.execute(
        """
        SELECT *
        FROM referrals
        WHERE id = ?
        """,
        (
            referral_id,
        )
    ).fetchone()

    if not referral:

        db.close()

        raise HTTPException(
            status_code=404,
            detail="Referral not found"
        )

    if referral["to_facility_id"] != user["facility_id"]:

        db.close()

        raise HTTPException(
            status_code=403,
            detail=
                "This referral is not assigned "
                "to your facility"
        )

    allowed_statuses = [
        "Pending",
        "Accepted",
        "In Progress",
        "Completed",
        "Rejected",
    ]

    new_status = status.strip()

    if new_status not in allowed_statuses:

        db.close()

        raise HTTPException(
            status_code=400,
            detail="Invalid referral status"
        )

    db.execute(
        """
        UPDATE referrals
        SET status = ?
        WHERE id = ?
        """,
        (
            new_status,
            referral_id,
        )
    )

    db.commit()

    updated = db.execute(
        """
        SELECT *
        FROM referrals
        WHERE id = ?
        """,
        (
            referral_id,
        )
    ).fetchone()

    db.close()

    return {
        "success": True,
        "message": "Referral status updated",
        "referral": dict(updated),
    }

# =========================================================
# DOCTOR - CONSULTATION
# =========================================================

@app.post(
    "/doctor/{user_id}/patients/{patient_id}/consultation"
)
async def create_doctor_consultation(
    user_id: str,
    patient_id: str,
    data: DoctorConsultationCreate
):
    db = get_db()

    user = get_user(
        db,
        user_id
    )

    if not user or user["role"] != "doctor":
        db.close()

        raise HTTPException(
            status_code=403,
            detail="Only authorized medical officers can record consultations"
        )

    if patient_id.strip() != data.patient_id.strip():
        db.close()

        raise HTTPException(
            status_code=400,
            detail="Patient ID mismatch"
        )

    allowed, reason = staff_can_access_patient(
        db,
        user_id,
        patient_id
    )

    if not allowed:
        db.close()

        raise HTTPException(
            status_code=403,
            detail=reason
        )

    diagnosis = data.diagnosis.strip()
    consultation_notes = data.consultation_notes.strip()
    follow_up = data.follow_up.strip()

    if not diagnosis and not consultation_notes:
        db.close()

        raise HTTPException(
            status_code=400,
            detail="Diagnosis or consultation notes are required"
        )

    visit_date = datetime.now().strftime(
        "%d %B %Y"
    )

    notes_parts = [
        "Doctor Consultation"
    ]

    if diagnosis:
        notes_parts.append(
            f"Diagnosis: {diagnosis}"
        )

    if consultation_notes:
        notes_parts.append(
            f"Consultation Notes: {consultation_notes}"
        )

    if follow_up:
        notes_parts.append(
            f"Follow-up: {follow_up}"
        )

    doctor_notes = " | ".join(
        notes_parts
    )

    cursor = db.cursor()

    cursor.execute(
        """
        INSERT INTO visits (
            patient_id,
            recorded_by,
            facility_id,
            visit_date,
            symptoms,
            temperature,
            blood_pressure,
            pulse,
            spo2,
            notes,
            triage_status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            patient_id,
            user_id,
            user["facility_id"],
            visit_date,
            "",
            "",
            "",
            "",
            "",
            doctor_notes,
            "Doctor Consultation",
        )
    )

    visit_id = cursor.lastrowid

    db.commit()

    visit = db.execute(
        """
        SELECT
            v.*,
            u.name AS recorder_name,
            p.name AS patient_name
        FROM visits v
        LEFT JOIN users u
            ON u.user_id = v.recorded_by
        LEFT JOIN patients p
            ON p.patient_id = v.patient_id
        WHERE v.id = ?
        """,
        (
            visit_id,
        )
    ).fetchone()

    db.close()

    return {
        "success": True,
        "message": "Doctor consultation recorded successfully",
        "visit": dict(visit),
    }


# =========================================================
# DOCTOR - CREATE PRESCRIPTION
# =========================================================

@app.post(
    "/doctor/{user_id}/patients/{patient_id}/prescription"
)
async def create_doctor_prescription(
    user_id: str,
    patient_id: str,
    data: DoctorConsultationCreate
):
    db = get_db()

    user = get_user(
        db,
        user_id
    )

    if not user or user["role"] != "doctor":
        db.close()

        raise HTTPException(
            status_code=403,
            detail="Only authorized medical officers can create prescriptions"
        )

    if patient_id.strip() != data.patient_id.strip():
        db.close()

        raise HTTPException(
            status_code=400,
            detail="Patient ID mismatch"
        )

    allowed, reason = staff_can_access_patient(
        db,
        user_id,
        patient_id
    )

    if not allowed:
        db.close()

        raise HTTPException(
            status_code=403,
            detail=reason
        )

    medicine = data.medicine.strip()
    dosage = data.dosage.strip()
    frequency = data.frequency.strip()
    duration = data.duration.strip()

    if not medicine:
        db.close()

        raise HTTPException(
            status_code=400,
            detail="Medicine is required"
        )

    if not dosage:
        db.close()

        raise HTTPException(
            status_code=400,
            detail="Dosage is required"
        )

    if not frequency:
        db.close()

        raise HTTPException(
            status_code=400,
            detail="Frequency is required"
        )

    if not duration:
        db.close()

        raise HTTPException(
            status_code=400,
            detail="Duration is required"
        )

    cursor = db.cursor()

    cursor.execute(
        """
        INSERT INTO prescriptions (
            patient_id,
            medicine,
            dosage,
            frequency,
            duration,
            prescribed_by,
            facility_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            patient_id,
            medicine,
            dosage,
            frequency,
            duration,
            user["name"],
            user["facility_id"],
        )
    )

    prescription_id = cursor.lastrowid

    db.commit()

    prescription = db.execute(
        """
        SELECT *
        FROM prescriptions
        WHERE id = ?
        """,
        (
            prescription_id,
        )
    ).fetchone()

    db.close()

    return {
        "success": True,
        "message": "Prescription created successfully",
        "prescription": dict(prescription),
    }


# =========================================================
# DOCTOR - PATIENT VISITS
# =========================================================

@app.get(
    "/doctor/{user_id}/patients/{patient_id}/visits"
)
async def doctor_patient_visits(
    user_id: str,
    patient_id: str
):

    db = get_db()

    user = get_user(
        db,
        user_id
    )

    if not user or user["role"] != "doctor":

        db.close()

        raise HTTPException(
            status_code=403,
            detail="Doctor access required"
        )

    allowed, reason = staff_can_access_patient(
        db,
        user_id,
        patient_id
    )

    if not allowed:

        db.close()

        raise HTTPException(
            status_code=403,
            detail=reason
        )

    visits = db.execute(
        """
        SELECT
            v.*,
            u.name AS recorder_name
        FROM visits v
        LEFT JOIN users u
            ON u.user_id = v.recorded_by
        WHERE v.patient_id = ?
        ORDER BY v.id DESC
        """,
        (
            patient_id,
        )
    ).fetchall()

    db.close()

    return {
        "success": True,
        "visits": [
            dict(visit)
            for visit in visits
        ],
    }


# =========================================================
# PATIENT TIMELINE
# =========================================================

@app.get("/patients/{patient_id}/timeline")
async def patient_timeline(
    patient_id: str
):

    db = get_db()

    patient = get_patient(
        db,
        patient_id
    )

    if not patient:

        db.close()

        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    visits = db.execute(
        """
        SELECT
            id,
            patient_id,
            recorded_by,
            facility_id,
            visit_date,
            symptoms,
            temperature,
            blood_pressure,
            pulse,
            spo2,
            notes,
            triage_status,
            created_at
        FROM visits
        WHERE patient_id = ?
        ORDER BY id DESC
        """,
        (
            patient_id,
        )
    ).fetchall()

    appointments = db.execute(
        """
        SELECT *
        FROM appointments
        WHERE patient_id = ?
        ORDER BY id DESC
        """,
        (
            patient_id,
        )
    ).fetchall()

    referrals = db.execute(
        """
        SELECT *
        FROM referrals
        WHERE patient_id = ?
        ORDER BY id DESC
        """,
        (
            patient_id,
        )
    ).fetchall()

    prescriptions = db.execute(
        """
        SELECT *
        FROM prescriptions
        WHERE patient_id = ?
        ORDER BY id DESC
        """,
        (
            patient_id,
        )
    ).fetchall()

    labs = db.execute(
        """
        SELECT *
        FROM lab_reports
        WHERE patient_id = ?
        ORDER BY id DESC
        """,
        (
            patient_id,
        )
    ).fetchall()

    db.close()

    return {
        "success": True,
        "patient": dict(patient),
        "visits": [
            dict(item)
            for item in visits
        ],
        "appointments": [
            dict(item)
            for item in appointments
        ],
        "referrals": [
            dict(item)
            for item in referrals
        ],
        "prescriptions": [
            dict(item)
            for item in prescriptions
        ],
        "labs": [
            dict(item)
            for item in labs
        ],
    }

# ==========================================
# NEARBY FACILITY MAP PROXY
# ==========================================

class FacilityQueryRequest(BaseModel):
    query: str


@app.post("/facilities/nearby")
async def nearby_facilities(data: FacilityQueryRequest):
    import urllib.request
    import urllib.parse
    import json

    try:
        overpass_url = "https://overpass-api.de/api/interpreter"

        form_data = urllib.parse.urlencode({
            "data": data.query
        }).encode("utf-8")

        request = urllib.request.Request(
            overpass_url,
            data=form_data,
            headers={
                "Content-Type": "application/x-www-form-urlencoded"
            },
            method="POST"
        )

        with urllib.request.urlopen(request, timeout=30) as response:
            result = json.loads(response.read().decode("utf-8"))

        return result

    except Exception as e:
        print("Nearby facility proxy error:", e)

        return {
            "elements": [],
            "error": "Nearby facility service temporarily unavailable."
        }


# =========================================================
# SERVER
# =========================================================

# Run from the backend folder:
#
# uvicorn main:app --reload
#
# API:
# http://127.0.0.1:8000
#
# Swagger:
# http://127.0.0.1:8000/docs