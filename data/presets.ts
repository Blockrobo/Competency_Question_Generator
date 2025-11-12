export interface TemplatePreset {
  topic: string;
  competency: string;
  description: string;
}

export const templatePresets: TemplatePreset[] = [
  {
    topic: "Fractions",
    competency: "Understanding equivalent fractions",
    description: "Students identify and create equivalent fractions using visual models and number lines",
  },
  {
    topic: "Fractions",
    competency: "Adding and subtracting fractions with like denominators",
    description: "Students add and subtract fractions with the same denominator",
  },
  {
    topic: "Decimals",
    competency: "Comparing decimal numbers",
    description: "Students compare decimals to the hundredths place using symbols and visual models",
  },
  {
    topic: "Decimals",
    competency: "Converting between fractions and decimals",
    description: "Students convert between fraction and decimal representations",
  },
  {
    topic: "Reading Comprehension",
    competency: "Identifying main idea and supporting details",
    description: "Students identify the main idea of a text and distinguish supporting details",
  },
  {
    topic: "Reading Comprehension",
    competency: "Making inferences from text",
    description: "Students draw conclusions based on textual evidence and prior knowledge",
  },
  {
    topic: "Geometry",
    competency: "Recognizing and classifying shapes",
    description: "Students identify and categorize 2D and 3D shapes by their attributes",
  },
  {
    topic: "Geometry",
    competency: "Understanding area and perimeter",
    description: "Students calculate area and perimeter of rectangles and composite shapes",
  },
  {
    topic: "Writing",
    competency: "Writing clear topic sentences",
    description: "Students craft topic sentences that clearly state the main idea of a paragraph",
  },
  {
    topic: "Writing",
    competency: "Using evidence to support claims",
    description: "Students support their arguments with relevant evidence from texts or observations",
  },
];

