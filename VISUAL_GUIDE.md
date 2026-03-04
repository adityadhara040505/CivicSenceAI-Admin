# 🎨 CivicSense AI Admin Portal - Visual Reference

## 🖼️ Page Layout Guide

### Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                         TOP NAVBAR                               │
│  [Page Title] [Search Bar] [🔔] [👤 Admin Profile ▼]           │
├──────────┬──────────────────────────────────────────────────────┤
│          │                                                       │
│  SIDEBAR │               MAIN CONTENT AREA                      │
│          │                                                       │
│ 🏢 Logo  │     [Stats Cards] [Charts] [Tables] [Forms]         │
│          │                                                       │
│ □ Dash   │     Responsive Grid Layout                           │
│ □ Upload │     Clean White Background                           │
│ □ Manage │     Card-based Design                                │
│ □ Users  │     Soft Shadows                                     │
│ □ Schemes│     Professional Spacing                             │
│ □ Reports│                                                       │
│ □ Settings│                                                      │
│          │                                                       │
│ □ Logout │                                                       │
│          │                                                       │
└──────────┴──────────────────────────────────────────────────────┘
```

---

## 📱 Page Breakdowns

### 1. Dashboard (`/dashboard`)

```
┌────────────────────────────────────────────────────────┐
│  [📊 Card]  [👥 Card]  [✓ Card]  [⚡ Card]            │
│  Policies   Users      Active     Simulations          │
│  1,248      45,872     3,429      128,394              │
└────────────────────────────────────────────────────────┘

┌──────────────────────┐  ┌──────────────────────┐
│                      │  │                      │
│  Users by State      │  │  Daily Active Users  │
│  [Bar Chart]         │  │  [Line Chart]        │
│                      │  │                      │
└──────────────────────┘  └──────────────────────┘

┌──────────────────────┐  ┌──────────────────────┐
│  Recent Policies     │  │  Top Schemes         │
│  • Budget 2026       │  │  PM-KISAN    [89%]  │
│  • MSME Credit       │  │  Mudra        [76%]  │
│  • PMAY Update       │  │  Startup      [68%]  │
│  • Green Energy      │  │                      │
└──────────────────────┘  └──────────────────────┘

┌────────────────────────────────────────────────┐
│  [Gradient CTA Card]                           │
│  "Ready to upload a new policy?"               │
│  [Upload Policy Button]                        │
└────────────────────────────────────────────────┘
```

---

### 2. Upload Policy (`/upload-policy`)

```
┌─────────────────────────────────────────────┐
│  Upload New Policy Document                 │
│                                             │
│  Policy Title: [____________]               │
│                                             │
│  Category: [Dropdown ▼]                     │
│                                             │
│  Description: [________________]            │
│               [________________]            │
│                                             │
│  ┌───────────────────────────────┐         │
│  │    📤                          │         │
│  │  Drop your PDF file here      │         │
│  │    or browse                   │         │
│  │                                │         │
│  │  Supports: PDF up to 50MB      │         │
│  └───────────────────────────────┘         │
│                                             │
│  ℹ️ Processing takes 2-5 minutes            │
│                                             │
│  [Upload & Analyze] [Clear Form]            │
└─────────────────────────────────────────────┘

Recent Uploads:
• Budget 2026 - 2 hours ago [Processed]
• MSME Credit - 5 hours ago [Processed]
```

---

### 3. Manage Policies (`/manage-policies`)

```
┌────────────────────────────────────────────────────┐
│  Manage Policies      [Filter] [Export]            │
│  10 policies found                                 │
│                                                    │
│  [🔍 Search] [Category ▼] [Status ▼]              │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│ Policy Name     │Category│Date     │Views│Status  │
├─────────────────┼────────┼─────────┼─────┼────────┤
│ Budget 2026     │ Tax    │Mar 1    │1245 │Active  │
│ MSME Credit     │ MSME   │Mar 1    │982  │Active  │
│ PMAY 2.0        │Housing │Feb 28   │2134 │Active  │
│ Green Energy    │Sustain │Feb 27   │876  │Active  │
└─────────────────┴────────┴─────────┴─────┴────────┘

Pagination: [<] [1] [2] [>]
```

---

### 4. User Analytics (`/user-analytics`)

```
┌──────────────────────────────────────────────┐
│ [👥] [📈] [📍] [📱]                         │
│ Total  Active  Top    Mobile               │
│ Users  Today   State  Users                │
└──────────────────────────────────────────────┘

┌────────────────┐  ┌────────────────┐
│ Users by State │  │ Daily Active   │
│ [Bar Chart]    │  │ [Line Chart]   │
└────────────────┘  └────────────────┘

┌────────────────┐  ┌────────────────┐
│ Age Demographics│  │ Device Usage   │
│ [Pie Chart]    │  │ [Pie Chart]    │
└────────────────┘  └────────────────┘

Engagement: 8m 42s | 78.5% | 21.3%
```

---

### 5. Scheme Insights (`/scheme-insights`)

```
┌──────────────────────────────────────────────┐
│ [127] [76%] [1.2M] [₹4.2L]                  │
│ Schemes Eligible Apps  Benefit              │
└──────────────────────────────────────────────┘

Top Performing Schemes:
┌────────────────────────────────────────────┐
│ PM-KISAN                        89%        │
│ [████████████████████░░]                   │
│ 245K applications • Avg: ₹6,000            │
└────────────────────────────────────────────┘

┌────────────────┐  ┌────────────────┐
│ By Category    │  │ What-If        │
│ [Bar Chart]    │  │ [Bar Chart]    │
└────────────────┘  └────────────────┘

Impact: ₹458.2 Cr | 892K | 12 days
```

---

### 6. Reports (`/reports`)

```
┌────────────────────────────────────────────┐
│ Reports & Analytics  [Generate New Report] │
└────────────────────────────────────────────┘

┌──────────────────┐  ┌──────────────────┐
│ 📄               │  │ 📄               │
│ Monthly User     │  │ Policy Impact    │
│ Activity Report  │  │ Analysis         │
│                  │  │                  │
│ March 2026       │  │ February 2026    │
│ 2.4 MB • PDF     │  │ 3.8 MB • PDF     │
│ [Download]       │  │ [Download]       │
└──────────────────┘  └──────────────────┘

[Need custom report? Create Custom Report]
```

---

### 7. Settings (`/settings`)

```
┌────────────────────────────────────────────┐
│ Admin Settings                             │
└────────────────────────────────────────────┘

Tabs: [General] [Admins] [Notifications] [API] [AI] [Database]

General Tab:
┌────────────────────────────────────────────┐
│ Platform Name: [CivicSense AI]             │
│ Support Email: [support@civicsense.ai]     │
│ Contact Phone: [+91 9876543210]            │
│ ☐ Enable maintenance mode                  │
│ [Save Changes]                             │
└────────────────────────────────────────────┘

Admin Accounts Tab:
┌────────────────────────────────────────────┐
│ Admin User                  [Edit]         │
│ admin@civicsense.ai                        │
│ [Super Admin] Active                       │
└────────────────────────────────────────────┘

API Keys Tab:
┌────────────────────────────────────────────┐
│ Production API Key          [Active]       │
│ cs_live_abc123...  [Copy] [Revoke]        │
│ Created: 2026-01-15                        │
└────────────────────────────────────────────┘

AI Configuration Tab:
┌────────────────────────────────────────────┐
│ AI Provider: [OpenAI GPT-4 ▼]             │
│ Model: [gpt-4-turbo]                       │
│ Temperature: [━━━●━━━━━━] 0.7             │
│ Max Tokens: [2048]                         │
│ ☑ Policy Analysis                          │
│ ☑ Eligibility Check                        │
│ [Save] [Test Connection]                   │
└────────────────────────────────────────────┘

Database Tab:
┌────────────────────────────────────────────┐
│ [1,248,392 Records] [24.8 GB Size]        │
│ Backup: Daily at 2:00 AM                   │
│ ☑ Auto-cleanup (90 days)                   │
│ [Create Backup] [Optimize]                 │
└────────────────────────────────────────────┘
```

---

## 🎨 Color Reference

### Primary Palette
```
Deep Blue Background: #1e3a8a  ████████
Primary Blue:         #1e40af  ████████
Light Blue:           #3b82f6  ████████
Lighter Blue:         #60a5fa  ████████
Pale Blue:            #dbeafe  ████████
```

### Accent Colors
```
Success Green:        #10b981  ████████
Warning Orange:       #f59e0b  ████████
Error Red:            #ef4444  ████████
Purple:               #8b5cf6  ████████
```

### Neutral Palette
```
Dark Gray:            #111827  ████████
Medium Gray:          #6b7280  ████████
Light Gray:           #f3f4f6  ████████
White:                #ffffff  ████████
```

---

## 🧩 Component Library

### Cards
```jsx
<Card>         // White bg, rounded-xl, shadow
<Card className="bg-blue-50">  // Custom bg
```

### Buttons
```jsx
<Button variant="primary">    // Blue bg
<Button variant="secondary">  // Gray bg
<Button variant="danger">     // Red bg
<Button variant="ghost">      // Transparent
```

### Inputs
```jsx
<Input label="Title" placeholder="..." />
<Select label="Category" options={[...]} />
```

### Badges
```jsx
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="danger">Archived</Badge>
```

---

## 📐 Spacing System

```
Gap-2:   0.5rem (8px)
Gap-3:   0.75rem (12px)
Gap-4:   1rem (16px)
Gap-6:   1.5rem (24px)
Gap-8:   2rem (32px)

Padding-4:  1rem (16px)
Padding-6:  1.5rem (24px)
Padding-8:  2rem (32px)

Rounded-lg:   0.5rem (8px)
Rounded-xl:   0.75rem (12px)
```

---

## 🎯 Responsive Breakpoints

```
sm:   640px   // Mobile landscape
md:   768px   // Tablet
lg:   1024px  // Desktop
xl:   1280px  // Large desktop
2xl:  1536px  // Extra large
```

---

## ✨ Animation Classes

```css
transition-all duration-200   // Smooth transitions
hover:scale-110              // Scale on hover
hover:shadow-lg              // Shadow on hover
animate-spin                 // Loading spinner
```

---

## 🔤 Typography Scale

```
text-xs:    0.75rem (12px)
text-sm:    0.875rem (14px)
text-base:  1rem (16px)
text-lg:    1.125rem (18px)
text-xl:    1.25rem (20px)
text-2xl:   1.5rem (24px)
text-3xl:   1.875rem (30px)
text-4xl:   2.25rem (36px)

font-medium:    500
font-semibold:  600
font-bold:      700
```

---

## 🎨 Icon Usage

All icons from **Lucide React**:
- LayoutDashboard, Upload, FileText
- Users, TrendingUp, FileBarChart
- Settings, LogOut, Search, Bell
- Edit, Trash2, Eye, Download
- Key, Shield, Database, Cpu

Size: `w-5 h-5` (20px) for buttons
Size: `w-6 h-6` (24px) for cards

---

## 📊 Chart Configuration

### Bar Chart
```jsx
<BarChart data={data}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="name" />
  <YAxis />
  <Tooltip />
  <Bar dataKey="value" fill="#1e40af" radius={[8,8,0,0]} />
</BarChart>
```

### Line Chart
```jsx
<LineChart data={data}>
  <Line type="monotone" stroke="#1e40af" strokeWidth={3} />
</LineChart>
```

### Pie Chart
```jsx
<PieChart>
  <Pie data={data} outerRadius={100} label />
</PieChart>
```

---

## 🚀 Quick Component Reference

### Stat Card
```jsx
<Card>
  <Icon /> 
  <Title />
  <Value />
  <Trend />
</Card>
```

### Data Table Row
```jsx
<tr>
  <td>Name</td>
  <td><Badge /></td>
  <td>Date</td>
  <td>
    <Button icon={Eye} />
    <Button icon={Edit} />
    <Button icon={Trash} />
  </td>
</tr>
```

---

## 📱 Mobile Responsiveness

```jsx
// Grid responsiveness
grid-cols-1      // Mobile: 1 column
md:grid-cols-2   // Tablet: 2 columns
lg:grid-cols-4   // Desktop: 4 columns

// Flex direction
flex-col         // Mobile: vertical
lg:flex-row      // Desktop: horizontal
```

---

**This visual reference helps you understand the complete UI structure without opening the application.**

View live: **http://localhost:3000**
