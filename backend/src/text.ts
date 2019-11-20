import { GraphQLObjectType, GraphQLNonNull, GraphQLString, GraphQLList, GraphQLInt } from 'graphql';

import Metalsmith, { Files } from 'metalsmith';
import markdown from 'metalsmith-markdown';

export type Language = {
  code: string;
};

export type Section = {
  id: string;
  number: number;
  name?: string;
  content?: string;
};

export type Chapter = {
  id?: string;
  number: number;
  name?: string;
  content?: string;
  sections?: Section[];
};

export type Plan = {
  id?: string;
  chapters: Chapter[];
};

export const sectionType: GraphQLObjectType = new GraphQLObjectType({
  name: 'Section',
  description: 'A transportation project in the City of Portland',
  fields: () => ({
    id: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The planning id of the project.'
    },
    number: {
      type: GraphQLInt,
      description: 'The section number for sorting purposes'
    },
    name: {
      type: GraphQLString,
      description: 'The name given to of the project.'
    },
    content: {
      type: GraphQLString,
      description: 'The GeoJSON object of the project.'
    }
  })
});

export const chapterType: GraphQLObjectType = new GraphQLObjectType({
  name: 'Chapter',
  description: 'A transportation project in the City of Portland',
  fields: () => ({
    id: {
      type: GraphQLString,
      description: 'The planning id of the project.'
    },
    number: {
      type: GraphQLInt,
      description: 'The chapter number for sorting purposes'
    },
    name: {
      type: GraphQLString,
      description: 'The name given to of the project.'
    },
    content: {
      type: GraphQLString,
      description: 'The GeoJSON object of the project.'
    },
    sections: {
      type: GraphQLList(sectionType),
      description: 'The sections that belong to this chapter.'
    }
  })
});

const parseChapter = (chapter: any): Chapter => chapter;

export const getChapters = (): Promise<Chapter[]> =>
  new Promise<Chapter[]>((resolve, reject) => {
    Metalsmith(__dirname)
      .source('../../docs')
      .destination('docs')
      .clean(false) // do not clean destination
      // directory before new build
      .use(markdown())
      .build(function(err: Error | null, files: Files) {
        if (err) throw reject(err);

        const chapters = new Array<Chapter>();

        Object.keys(files).forEach(key => {
          const text = files[key];

          let chapter: Chapter | undefined = { number: text.chapter };

          if (text.chapter) {
            chapter = chapters.find(c => {
              return c.number == text.chapter;
            });

            if (!chapter) {
              chapter = { number: text.chapter, sections: new Array<Section>() };
              chapters.push(chapter);
            }

            // if it's a section, add it to the chapter and exit
            if (text.section) {
              const section: Section = {
                id: text.id,
                number: text.section,
                name: text.name,
                content: text.contents.toString()
              };
              chapter.sections?.push(section);
              return;
            }

            // is a chapter, parse it
            Object.assign(chapter, {
              id: text.id,
              number: text.chapter,
              name: text.name,
              content: text.contents.toString()
            });
          }
        });

        resolve(chapters);
      });
  });
