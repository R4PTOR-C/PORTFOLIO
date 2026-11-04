'use client';
import { TbMail, TbBrandGithub, TbBrandLinkedin, TbBrandInstagram } from 'react-icons/tb';

/* One icon family for interface glyphs: Tabler, stroke 1.6, no SVG paths
   pasted into this file. The coloured vendor logos in the Stack section come
   from Simple Icons instead, because there the mark IS the information. */
export const socialLinks = [
  { label: 'Email',     href: 'mailto:rafaelcroriz7@gmail.com',                      icon: <TbMail className="w-[18px] h-[18px]" strokeWidth={1.6} />           },
  { label: 'GitHub',    href: 'https://github.com/R4PTOR-C',                         icon: <TbBrandGithub className="w-[18px] h-[18px]" strokeWidth={1.6} />    },
  { label: 'LinkedIn',  href: 'https://www.linkedin.com/in/rafael-caldas-76174b207', icon: <TbBrandLinkedin className="w-[18px] h-[18px]" strokeWidth={1.6} />  },
  { label: 'Instagram', href: 'https://instagram.com/rafaelroriz7',                  icon: <TbBrandInstagram className="w-[18px] h-[18px]" strokeWidth={1.6} /> },
];
