import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData, type MetaFunction} from 'react-router';
import {Tower, TOWER_QUERY, CLOUD_QUERY} from '../components/Tower';
import artistStatement from '~/assets/ArtistStatement.png';

export const meta: MetaFunction = () => {
  return [{title: 'About | Jiagia Studios'}];
};

export async function loader({context}: LoaderFunctionArgs) {
  const handle = "home-page";
  const type = "tower";
  
  const tower = context.storefront
    .query(TOWER_QUERY, {
      variables: {handle, type},
    })
    .catch((error: any) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  const clouds = context.storefront
    .query(CLOUD_QUERY)
    .catch((error: any) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  return {
    tower,
    clouds,
  };
}

export default function About() {
  const {tower, clouds} = useLoaderData<typeof loader>();

  return (
    <>
      <AboutUs />
      <div className="w-full bg-black text-white overflow-x-hidden clear-both">
        <Tower tower={tower} clouds={clouds} />
      <section
        className="relative"
        style={{
          backgroundImage: 'url(https://cdn.shopify.com/s/files/1/0753/7868/8295/files/stars.png?v=1735004828)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="w-full pt-12 md:pt-20 pb-8 md:pb-12">
          <ArtistStatementText />
        </div>
        <div className="w-full">
          <img src={artistStatement} alt="Artist Statement" className="w-full h-auto object-cover" />
        </div>
      </section>
    </div>
    </>
  );
}

function AboutUs() {
  return (
    <div className="flex flex-col items-center gap-4 max-w-2xl py-12 md:py-20 mx-auto text-center px-4 md:px-8 mb-8 md:mb-12">
      <h2 className="text-2xl md:text-3xl font-bold">ABOUT US</h2>
      <p className="text-sm md:text-base leading-relaxed">
      Jiagia Studios is a creative collective and perceptual research unit. Our primary mission is to explore and document the Daydream Universe. A layered dimension that exists at the convergence of ancient mythology, collective memory, and our immersive digital present.
      </p>
      <p className="text-sm md:text-base leading-relaxed">
      In an age of accelerating information and fleeting attention, our work is an act of engagement. We believe that by observing, documenting, and reinterpreting these  realities, we can build a new visual language... one that makes the unseen visible and gives form to the forces that shape our consciousness.
      </p>
      <p className="text-sm md:text-base leading-relaxed">
      The artifacts we create, from fine art paintings to digital sightings, are the published findings of our exploration. They are worlds to be entered and understood. We invite you to join our research, to engage with our findings, and to remember that what we choose to preserve, question, and imagine becomes the foundation for every future we build.
      </p>
    </div>
  );
}

function ArtistStatementText() {
  return (
    <div className="w-full pt-12 md:pt-20 pb-8 md:pb-12">
      <div className="text-center sm:w-1/2 lg:w-2/5 mx-auto px-4 md:px-8">
        <h2 className="bg-black bg-opacity-80 rounded-lg px-4 py-2 text-2xl md:text-[36px] mb-6 md:mb-8 inline-block">Artist Statement</h2>
        <div className="bg-black bg-opacity-80 rounded-lg p-4 md:p-6 text-center space-y-4">
          <p>
            Parth&apos;s work <b>examines the parallels between organized </b>religion and digital immersion, exploring how contemporary culture seeks meaning, comfort, and a sense of self through virtual experiences in the same way past generations sought divinity.
          </p>
          <p>
            Employing a vibrant, cartoon-inspired aesthetic rooted in internet iconography, Parth constructs dense, layered visual narratives. These layered compositions reflect the nonlinear way younger audiences engage with culture: not as a fixed history, but as a living dialogue of reverence, remix, and reinterpretation.
          </p>
          <p>
            The worlds he builds are not meant as simple escapes. Each piece is an invitation to the viewer: to enter these imagined realms, to reflect on their messages, and ultimately, to reconsider the realities we all inhabit.
          </p>
        </div>
      </div>
    </div>
  );
}

