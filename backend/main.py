from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import sqlite3
from datetime import datetime

# =========================================================
# APP
# =========================================================

app = FastAPI(
    title="SIHGPT API",
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
# BASIC ROUTES
# =========================================================

@app.get("/")
async def root():

    return {
        "status": "ok",
        "service": "SIHGPT API",
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
            dict(row)
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