# FHIR HIPAA Assessment Project

A comprehensive healthcare data querying system demonstrating HIPAA-compliant architecture with AI-powered natural language processing for FHIR resources.

## 🏗️ Project Structure

This project is organized into three main parts, each addressing different aspects of a healthcare data system:

### 📊 **Part 1: FHIR NLP Service (Backend)**
`/part1/` - AI-powered healthcare data processing service

**What's Inside:**
- **`fhir_nlp_service.py`** - FastAPI-based backend service that converts natural language queries into FHIR-compliant API requests
- **`requirements.txt`** - Python dependencies including FastAPI, spaCy, and FHIR client libraries
- **`Dockerfile`** - Container configuration for production deployment
- **`example_queries_results.json`** - Sample query results for testing and demonstration
- **`README.md`** - Detailed backend documentation and API reference

**Key Features:**
- Natural language processing using spaCy
- Real-time FHIR data fetching from HAPI FHIR server
- SNOMED CT medical terminology mapping
- Automatic query intent detection and parameter extraction
- Docker-ready production deployment

---

### 🖥️ **Part 2: Frontend Application**
`/part2/` - Modern React-based user interface

**What's Inside:**
- **`app/page.tsx`** - Main application interface with query input and results display
- **`app/components/`** - Modular React components:
  - `QueryInput.tsx` - Natural language query input with suggestions
  - `QueryDetails.tsx` - NLP analysis visualization
  - `ResultsChart.tsx` - Interactive patient data charts
  - `ResultsTable.tsx` - Filterable patient data tables
- **`app/types/fhir.ts`** - TypeScript type definitions for FHIR resources
- **`package.json`** - Node.js dependencies and build scripts
- **`Dockerfile`** - Container configuration for frontend deployment
- **`tailwind.config.js`** - Tailwind CSS styling configuration

**Key Features:**
- Next.js 14 with TypeScript and Tailwind CSS
- Responsive design for desktop, tablet, and mobile
- Interactive data visualization and filtering
- Mock data simulation for demonstration purposes
- Docker-ready production deployment

---

### 📋 **Part 3: Security & Compliance Documentation**
`part3.md` - Comprehensive HIPAA compliance architecture

**What's Inside:**
- **Authentication & Authorization Framework** - OAuth 2.0, SMART on FHIR, MFA implementation
- **Role-Based Access Control (RBAC)** - Healthcare role hierarchy and granular permissions
- **Data Privacy & Protection Strategy** - Encryption standards, data classification, minimization
- **Comprehensive Audit Logging** - Event tracking, compliance monitoring, retention policies
- **Network Security Architecture** - Segmentation, API security, infrastructure protection
- **Incident Response Planning** - Security incident procedures and business continuity
- **Compliance Monitoring** - Automated checks, assessments, and reporting frameworks
- **Implementation Roadmap** - Phased approach to deployment and optimization

**Key Topics Covered:**
- HIPAA compliance requirements and implementation
- Multi-layer security architecture design
- Healthcare-specific authentication protocols
- Audit trail management and regulatory compliance
- Risk assessment and mitigation strategies

---

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)
```bash
# Clone the repository
git clone https://github.com/YASH-GU24/fhir-hippa-assessment.git
cd fhir-hippa-assessment

# Start backend service
cd part1
docker build -t fhir-nlp-service . && docker run -p 8000:8000 fhir-nlp-service

# Start frontend (in new terminal)
cd ../part2
docker build -t fhir-nlp-frontend . && docker run -p 3000:3000 fhir-nlp-frontend
```

### Option 2: Local Development
```bash
# Backend setup
cd part1
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python fhir_nlp_service.py

# Frontend setup (in new terminal)
cd part2
npm install
npm run dev
```

## 🔗 Access Points

- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 🧪 Example Queries

Try these natural language queries in the frontend:

1. **"Show me all diabetic patients over 50"**
2. **"Find female patients with hypertension under 65"**
3. **"How many male patients have depression?"**
4. **"List patients with asthma between 30 and 45 years old"**
5. **"Show me patients with heart disease and diabetes over 60"**

## 📚 Documentation

- **Backend API**: See `part1/README.md` for detailed API documentation
- **Frontend Guide**: See `part2/README.md` for UI component documentation
- **Security Architecture**: See `part3.md` for HIPAA compliance framework

## 🛡️ Security & Compliance

This project demonstrates enterprise-grade security practices:

- **HIPAA Compliance**: Comprehensive framework addressing all required safeguards
- **Data Encryption**: AES-256 encryption for data at rest and TLS 1.3 for data in transit
- **Access Controls**: Role-based permissions with healthcare-specific roles
- **Audit Logging**: Complete audit trail for all data access and modifications
- **Authentication**: Multi-factor authentication with SMART on FHIR integration

## 🏥 Healthcare Standards

- **FHIR R4 Compliance**: Full compatibility with FHIR R4 specification
- **SNOMED CT Integration**: Medical terminology mapping for accurate condition coding
- **HL7 Standards**: Adherence to healthcare interoperability standards
- **SMART on FHIR**: Healthcare-specific OAuth 2.0 implementation

## 🔧 Technology Stack

### Backend
- **Python 3.11+** with FastAPI framework
- **spaCy** for natural language processing
- **FHIR Client** for healthcare data integration
- **Docker** for containerization

### Frontend
- **Next.js 14** with React and TypeScript
- **Tailwind CSS** for responsive design
- **Lucide React** for icons
- **Docker** for containerization

### Infrastructure
- **Docker** containerization
- **OAuth 2.0** authentication
- **TLS/SSL** encryption
- **Audit logging** framework

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For questions or support:

1. Check the individual README files in each part directory
2. Review the comprehensive security documentation in `part3.md`
3. Open an issue in the GitHub repository
4. Refer to the API documentation at http://localhost:8000/docs when running the backend

---

**Note**: This is a demonstration project showcasing HIPAA-compliant architecture and FHIR integration. For production use, additional security hardening, testing, and compliance validation would be required.