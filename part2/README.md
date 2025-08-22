# FHIR NLP Query Tool - Frontend

Modern, responsive web interface built with Next.js, TypeScript, and Tailwind CSS. Provides an intuitive demonstration interface for healthcare data queries using natural language with simulated results.

## 🚀 Features

- **Natural Language Interface**: User-friendly query input with suggestions
- **Mock Data Processing**: Simulated query processing with loading states
- **Data Visualization**: Interactive charts showing patient demographics
- **Detailed Results**: Comprehensive patient data tables with filtering
- **Query Analysis**: Visual breakdown of simulated NLP entity extraction
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Optimized UI**: Clean, accessible interface design

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Charts**: Custom React components
- **Deployment**: Docker-ready

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Docker (optional)

## 🐳 Running with Docker (Recommended)

### Build and Run
```bash
# Build the Docker image
docker build -t fhir-nlp-frontend .

# Run the container
docker run -p 3000:3000 fhir-nlp-frontend
```

### Background Mode
```bash
docker run -d -p 3000:3000 --name fhir-frontend fhir-nlp-frontend
```

## 🚀 Running without Docker

### 1. Install Dependencies
```bash
npm install
# or
yarn install
```

### 2. Start Development Server
```bash
npm run dev
# or
yarn dev
```

### 3. Build for Production
```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🌐 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server on http://localhost:3000 |
| `npm run build` | Build the application for production |
| `npm start` | Start the production server |
| `npm run lint` | Run ESLint for code quality |
| `npm run type-check` | Run TypeScript type checking |

## 📱 Application Structure

```
frontend/
├── app/
│   ├── components/          # React components
│   │   ├── QueryInput.tsx   # Natural language query input
│   │   ├── QueryDetails.tsx # NLP analysis display
│   │   ├── ResultsChart.tsx # Data visualization
│   │   └── ResultsTable.tsx # Patient data table
│   ├── types/
│   │   └── fhir.ts         # TypeScript type definitions
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout component
│   └── page.tsx            # Main application page
├── public/                 # Static assets
├── Dockerfile             # Docker configuration
└── package.json           # Dependencies and scripts
```

## 🎨 UI Components

### Query Input Component
- **Auto-suggestions**: Predefined example queries
- **Real-time validation**: Input validation and formatting
- **Loading states**: Visual feedback during processing
- **Accessibility**: ARIA labels and keyboard navigation

### Query Details Component
- **Entity Extraction**: Visual display of simulated medical entity extraction
- **Query Analysis**: Shows mock NLP processing results
- **Parameter Display**: Demonstrates query parameter generation
- **Processing Summary**: Step-by-step simulated analysis breakdown

### Results Visualization
- **Demographics Chart**: Age and gender distribution
- **Condition Charts**: Medical condition breakdown
- **Interactive Tables**: Sortable and filterable patient data
- **Export Options**: Copy URLs and data export

### Results Table
- **Advanced Filtering**: Filter by age, gender, conditions
- **Sorting**: Multi-column sorting capabilities
- **Pagination**: Handle large datasets efficiently
- **Responsive Design**: Mobile-optimized table layout

## 📊 Example Queries

The frontend includes predefined example queries for easy testing:

### 1. Basic Condition Search
```
"Show me all diabetic patients over 50"
```

### 2. Demographic Filtering
```
"Find female patients with hypertension under 65"
```

### 3. Age Range Queries
```
"List patients with asthma between 30 and 45 years old"
```

### 4. Count Queries
```
"How many male patients have depression?"
```

### 5. Multiple Conditions
```
"Show me patients with heart disease and diabetes over 60"
```

### 6. Cancer Research
```
"Find all patients with cancer under 40"
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the frontend directory:

```env
# Application settings
NEXT_PUBLIC_APP_NAME="FHIR NLP Query Tool"
NEXT_PUBLIC_MAX_RESULTS=100
NEXT_PUBLIC_DEMO_MODE=true
```

### Mock Data Configuration

The frontend uses simulated data for demonstration purposes. You can customize the mock responses in `app/page.tsx`:

```typescript
// Customize mock patient data generation
const patientCount = Math.floor(Math.random() * 8) + 3; // 3-10 patients
const mockPatients = generateMockPatients(patientCount, entities);
```

## 🎯 Key Features Explained

### Natural Language Processing Display
- **Entity Visualization**: Shows simulated extraction of conditions, age filters, gender
- **Intent Detection**: Demonstrates query intent classification (search, count, aggregation)
- **Medical Code Mapping**: Visual representation of simulated SNOMED CT code mappings

### Data Visualization
- **Patient Demographics**: Interactive charts showing age and gender distribution
- **Condition Analysis**: Breakdown of medical conditions found
- **Geographic Data**: Patient location information when available

### Advanced Filtering
- **Multi-criteria Filtering**: Combine age, gender, and condition filters
- **Real-time Updates**: Instant filtering without page reload
- **Filter Persistence**: Maintains filter state during navigation

### Responsive Design
- **Mobile-First**: Optimized for mobile devices
- **Tablet Support**: Adapted layouts for tablet screens
- **Desktop Enhancement**: Full-featured desktop experience

## 🎨 Styling and Theming

### Tailwind CSS Configuration
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        medical: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
        }
      },
    },
  },
}
```

### Custom Components
- **Card Component**: Consistent card styling across the app
- **Button Variants**: Primary, secondary, and disabled states
- **Form Controls**: Styled inputs, selects, and textareas
- **Loading States**: Spinners and skeleton screens

## 🔍 Search and Filter Features

### Query Suggestions
- **Contextual Suggestions**: Based on current input
- **Category-based**: Organized by condition, demographic, and complex queries
- **Quick Selection**: Click to populate query input

### Result Filtering
- **Age Groups**: Filter by predefined age ranges
- **Gender Selection**: Male, female, or all genders
- **Condition Types**: Filter by specific medical conditions
- **Combined Filters**: Multiple criteria simultaneously

### Sorting Options
- **Patient Name**: Alphabetical sorting
- **Age**: Numerical age sorting
- **Gender**: Gender-based grouping
- **Condition Count**: Sort by number of conditions

## 🚨 Error Handling

### User-Friendly Error Messages
- **Input Validation**: Real-time query validation feedback
- **Processing Errors**: Clear messaging for invalid queries
- **Fallback UI**: Graceful handling of edge cases
- **User Guidance**: Helpful suggestions for query improvement

### Loading States
- **Query Processing**: Visual feedback during simulated processing
- **Data Generation**: Loading indicators for mock data creation
- **Progressive Loading**: Skeleton screens for better UX

## 📱 Mobile Optimization

### Responsive Breakpoints
- **Mobile**: < 640px - Single column layout
- **Tablet**: 640px - 1024px - Two column layout
- **Desktop**: > 1024px - Full multi-column layout

### Touch-Friendly Interface
- **Large Touch Targets**: Minimum 44px touch areas
- **Swipe Gestures**: Table scrolling and navigation
- **Mobile Navigation**: Optimized menu and controls

## 🔒 Security Considerations

### Input Sanitization
- **XSS Protection**: All user inputs are sanitized
- **CSRF Prevention**: Built-in Next.js protections
- **Content Security Policy**: Strict CSP headers

### Data Privacy
- **No Local Storage**: No sensitive data stored locally
- **Mock Data Only**: All patient data is simulated for demonstration
- **No External Calls**: Self-contained application with no external dependencies

## 🧪 Testing

### Development Testing
```bash
# Run the development server
npm run dev

# Test with example queries
# Navigate to http://localhost:3000
# Try the predefined example queries
```

### Production Testing
```bash
# Build and test production version
npm run build
npm start

# Access at http://localhost:3000
```

## 🐛 Troubleshooting

### Common Issues

1. **Mock Data Not Loading**
   ```
   Error: Failed to generate mock data
   ```
   - Check browser console for JavaScript errors
   - Verify all dependencies are installed
   - Ensure proper TypeScript configuration

2. **Build Errors**
   ```bash
   npm run build
   # Check for TypeScript errors
   npm run type-check
   ```

3. **Styling Issues**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   npm run dev
   ```

4. **Docker Build Issues**
   ```bash
   # Clean Docker cache
   docker system prune
   docker build --no-cache -t fhir-nlp-frontend .
   ```

### Debug Mode
```bash
# Enable verbose logging
DEBUG=* npm run dev
```

## 📊 Performance Optimization

### Built-in Optimizations
- **Next.js Image Optimization**: Automatic image optimization
- **Code Splitting**: Automatic route-based code splitting
- **Static Generation**: Pre-rendered pages where possible
- **Bundle Analysis**: Built-in bundle analyzer

### Custom Optimizations
- **Lazy Loading**: Components loaded on demand
- **Memoization**: React.memo for expensive components
- **Virtual Scrolling**: For large data tables
- **Debounced Search**: Optimized query input handling

## 🔄 Mock Data Structure

### Query Processing
```typescript
// Simulated query processing
const simulateBackendCall = async (query: string): Promise<FHIRQueryResponse> => {
  // Mock entity extraction
  // Generate simulated patient data
  // Return formatted response
}
```

### Response Format
```typescript
interface FHIRQueryResponse {
  original_query: string;
  extracted_entities: ExtractedEntity;
  fhir_query: FHIRQuery;
  simulated_url: string;
  example_results: Patient[];
}
```

## 🚀 Deployment

### Docker Deployment
```bash
# Build for production
docker build -t fhir-nlp-frontend .

# Run in production
docker run -p 3000:3000 -e NODE_ENV=production fhir-nlp-frontend
```

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod
```

### Environment Setup
```env
# Production environment variables
NEXT_PUBLIC_APP_NAME="FHIR NLP Query Tool"
NEXT_PUBLIC_DEMO_MODE=true
NODE_ENV=production
```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Maintain responsive design principles
- Add proper error handling
- Include loading states for async operations

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
