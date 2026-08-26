// Real content extracted from the legacy Django templates
// indoor/template/ject1.html .. ject6.html (see MIGRATION_PLAN.md / API_MAPPING.md
// for the /ject{n} -> /showcase/{n} route mapping).
//
// Each of the six source templates is a near-identical "project details" page
// with only the title, a short intro paragraph, a longer body paragraph, and a
// hero image (/static/assets/img/projects/{n}.png) actually varying between
// them. All six also show an identical "4 out of 5 star" rating block and a
// "Client" line whose value is simply the project name repeated - that's
// carried over here as `rating`/`client` for honesty, even though it isn't
// very meaningful data.
//
// Two things worth flagging (kept intentionally, not "fixed", since they
// reflect the actual source content rather than invented copy):
//   - ject4.html has its own distinct title ("JW Marriott Marquis Hotel
//     (Dubai)") but its paragraphs are a verbatim copy-paste of ject3.html's
//     Burj Al Arab text (still refers to "Burj Al Arab" throughout).
//   - ject6.html is a full duplicate of ject5.html: identical title
//     ("Al Jawahar (Riyadh)"), identical hero image path
//     (/static/assets/img/projects/5.png, NOT 6.png), and identical body
//     text. A distinct 6.png asset exists in the source static folder but is
//     never actually referenced by ject6.html.

const showcaseProjects = {
  1: {
    id: 1,
    title: 'Riyadh Gallery Mall (Riyadh)',
    location: 'Riyadh',
    rating: 4,
    ratingOutOf: 5,
    client: 'Riyadh Gallery Mall (Riyadh)',
    summary:
      "Indoor Axe, the door manufacturing company, proudly supplied doors for Riyadh Gallery Mall in Riyadh, combining craftsmanship and functionality to enhance the mall's aesthetic appeal and security.",
    description:
      "Indoor Axe, a premier door manufacturing company, proudly contributed to the architectural excellence of Riyadh Gallery Mall in Riyadh. Renowned for its craftsmanship, Indoor Axe seamlessly blended innovation and functionality in providing high-quality doors for this prestigious project. The doors not only enhance the mall's aesthetic appeal but also prioritize security and durability. Meticulously designed to complement the modern and dynamic ambiance of Riyadh Gallery Mall, Indoor Axe's doors showcase a perfect fusion of style and substance. This collaboration underscores Indoor Axe's commitment to delivering top-notch solutions for large-scale commercial developments, elevating the overall architectural experience for both visitors and occupants of Riyadh Gallery Mall.",
    images: ['/images/project-1.png'],
  },
  2: {
    id: 2,
    title: 'Jeddah Street International Circuit',
    location: 'Jeddah',
    rating: 4,
    ratingOutOf: 5,
    client: 'Jeddah Street International Circuit',
    summary:
      'Indoor Axe, a leading door manufacturing company, proudly supplied doors for the prestigious Jeddah Street International Circuit, combining craftsmanship and durability for a seamless blend of functionality and aesthetics.',
    description:
      "Indoor Axe, the leading door manufacturing company, proudly supplied its exceptional doors for the prestigious Jeddah Street International Circuit. The project involved crafting specialized doors to meet the circuit's unique requirements, blending functionality with aesthetics to enhance the facility's overall appeal. Indoor Axe's doors seamlessly marry durability and style, providing a secure and visually appealing entrance to key areas within the renowned racing venue. The company's commitment to quality and precision is evident in every door, contributing to the overall success of the Jeddah Street International Circuit. As a key player in the project, Indoor Axe continues to demonstrate its expertise in delivering tailored door solutions for diverse and high-profile applications.",
    images: ['/images/project-2.png'],
  },
  3: {
    id: 3,
    title: 'Burj Al Arab (Dubai)',
    location: 'Dubai',
    rating: 4,
    ratingOutOf: 5,
    client: 'Burj Al Arab (Dubai)',
    summary:
      'Indoor Axe crafted exquisite doors for the iconic Burj Al Arab in Dubai, blending precision engineering with artistic elegance to enhance the grandeur of this world-renowned landmark.',
    description:
      "Indoor Axe, a leading door manufacturing company, proudly contributed to the iconic Burj Al Arab project in Dubai. Renowned for its expertise, Indoor Axe crafted bespoke doors that seamlessly blended luxury and functionality for the world-famous hotel. The intricately designed doors not only enhanced the aesthetics of the Burj Al Arab but also met the high standards of security and durability expected in such a prestigious setting. Indoor Axe's commitment to precision and quality ensured that each door reflected the opulence and sophistication synonymous with the Burj Al Arab, making it a noteworthy collaboration in the realm of architectural excellence.",
    images: ['/images/project-3.png'],
  },
  4: {
    id: 4,
    title: 'JW Marriott Marquis Hotel (Dubai)',
    location: 'Dubai',
    rating: 4,
    ratingOutOf: 5,
    client: 'JW Marriott Marquis Hotel (Dubai)',
    // Note: the source template (ject4.html) gives this project its own
    // title but reuses ject3.html's Burj Al Arab paragraphs verbatim -
    // carried over as-is rather than invented/corrected.
    summary:
      'Indoor Axe crafted exquisite doors for the iconic Burj Al Arab in Dubai, blending precision engineering with artistic elegance to enhance the grandeur of this world-renowned landmark.',
    description:
      "Indoor Axe, a leading door manufacturing company, proudly contributed to the iconic Burj Al Arab project in Dubai. Renowned for its expertise, Indoor Axe crafted bespoke doors that seamlessly blended luxury and functionality for the world-famous hotel. The intricately designed doors not only enhanced the aesthetics of the Burj Al Arab but also met the high standards of security and durability expected in such a prestigious setting. Indoor Axe's commitment to precision and quality ensured that each door reflected the opulence and sophistication synonymous with the Burj Al Arab, making it a noteworthy collaboration in the realm of architectural excellence.",
    images: ['/images/project-4.png'],
  },
  5: {
    id: 5,
    title: 'Al Jawahar (Riyadh)',
    location: 'Riyadh',
    rating: 4,
    ratingOutOf: 5,
    client: 'Al Jawahar (Riyadh)',
    summary:
      'Indoor Axe proudly supplied doors for the prestigious Al Jawahar project in Riyadh, combining craftsmanship and quality to enhance the aesthetic and functional appeal of the space.',
    description:
      "Indoor Axe, a leading door manufacturing company, proudly contributed to the prestigious Al Jawahar project in Riyadh. Renowned for its expertise in crafting high-quality doors, Indoor Axe delivered a tailored solution that seamlessly blended functionality with aesthetic appeal. The doors installed at Al Jawahar showcase the company's commitment to precision engineering, durability, and style.\n\nIndoor Axe's innovative designs not only enhance the architectural integrity of the space but also prioritize security and energy efficiency. The collaboration with Al Jawahar reflects Indoor Axe's dedication to delivering superior door solutions that meet the unique requirements of each project. With a focus on quality craftsmanship and customer satisfaction, Indoor Axe continues to be a trusted partner in the realm of door manufacturing, leaving a lasting impression on prestigious projects like Al Jawahar in Riyadh.",
    images: ['/images/project-5.png'],
  },
  6: {
    id: 6,
    title: 'Al Jawahar (Riyadh)',
    location: 'Riyadh',
    rating: 4,
    ratingOutOf: 5,
    client: 'Al Jawahar (Riyadh)',
    // Note: ject6.html is a full duplicate of ject5.html in the source -
    // same title, same hero image path, same copy. Reflected honestly here
    // rather than fabricating distinct content for it.
    summary:
      'Indoor Axe proudly supplied doors for the prestigious Al Jawahar project in Riyadh, combining craftsmanship and quality to enhance the aesthetic and functional appeal of the space.',
    description:
      "Indoor Axe, a leading door manufacturing company, proudly contributed to the prestigious Al Jawahar project in Riyadh. Renowned for its expertise in crafting high-quality doors, Indoor Axe delivered a tailored solution that seamlessly blended functionality with aesthetic appeal. The doors installed at Al Jawahar showcase the company's commitment to precision engineering, durability, and style.\n\nIndoor Axe's innovative designs not only enhance the architectural integrity of the space but also prioritize security and energy efficiency. The collaboration with Al Jawahar reflects Indoor Axe's dedication to delivering superior door solutions that meet the unique requirements of each project. With a focus on quality craftsmanship and customer satisfaction, Indoor Axe continues to be a trusted partner in the realm of door manufacturing, leaving a lasting impression on prestigious projects like Al Jawahar in Riyadh.",
    images: ['/images/project-5.png'],
  },
};

export default showcaseProjects;
