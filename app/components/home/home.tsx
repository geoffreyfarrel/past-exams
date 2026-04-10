import { Accordion, AccordionItem } from '@heroui/react';
import Link from 'next/link';
import { ReactNode } from 'react';

import { MAJORS } from '@/utils/constants';

export default function Home(): ReactNode {
  const groupedMajors = MAJORS.reduce(
    (acc, major) => {
      const college = major.college;
      if (!acc[college]) {
        acc[college] = [];
      }

      acc[college].push(major);

      return acc;
    },
    {} as Record<string, typeof MAJORS>,
  );

  return (
    <div>
      <h2 className="font-bold text-xl upper mb-4">Select a major</h2>
      <Accordion variant="splitted">
        {Object.entries(groupedMajors).map(([college, majors]) => (
          <AccordionItem
            key={college}
            aria-label={college}
            title={college}
            classNames={{
              title: 'font-bold text-gray-700',
              content: ' flex flex-col',
            }}
          >
            {majors.map((major) => (
              <Link
                key={major.key}
                href={`/${major.key.toLowerCase()}`}
                className="group flex items-center justify-between w-full p-4 hover:bg-blue-50 transition-all border-t border-gray-100"
              >
                <span className="text-sm font-medium text-gray-600 group-hover:text-blue-600">
                  {major.title}
                </span>
                <span className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  View Exams →
                </span>
              </Link>
            ))}
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
