// SPA
// SSR
// SSG
import { GetStaticProps } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { api } from '../services/api';
import {  format, parseISO} from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'
import converteDurationToTimeString from '../utils/converteDurationToTimeString';

import styles from './home.module.scss'

interface Episode {
  id: string,
  title: string,
  members: string,
  thumbnail: string,
  publishedAt: string,
  description: string,
  url: string,
  duration: string,
  durationAsString: string
}

interface HomeProps {
  latestEpisodes: Episode[] ,
  allEpisodes: Episode[]
}

const index = ({latestEpisodes, allEpisodes }: HomeProps ) => {

  return (
    <div className={styles.homePage}>
      <section className={styles.latesEpisodes}>
        <h2>Últimos lançamentos</h2>

        <ul>
        {latestEpisodes.map((item) => (
          <li key={item.id}>
            <Image 
              width={192} 
              height={192} 
              src={item.thumbnail} 
              alt={item.title}
              objectFit='cover'
            />

            <div className={styles.episodeDetails}>
              <Link href={`/episode/${item.id}`}>
                <a>{item.title}</a>
              </Link>
              <p>{item.members}</p>
              <span>{item.publishedAt}</span>
              <span>{item.durationAsString}</span>
            </div>

            <button type='button'>
              <img src="/play-green.svg" alt="Tocar episódio"/>
            </button>
            
          </li>
          ))}
        </ul>
      </section>

      <section className={styles.allEpisodes}>
        <h2>Todos episódios</h2>

        <table cellSpacing={0}>
          <thead>
            <tr>
              <th></th>
              <th>Podcast</th>
              <th>Integrantes</th>
              <th>Data</th>
              <th>Duração</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {allEpisodes.map(item => (
              <tr key={item.id}>
                <td style={{ width: 72 }}>
                  <Image
                    width={120}
                    height={120}
                    src={item.thumbnail}
                    alt={item.title}
                    objectFit='cover'
                  />
                </td>
                <td>
                  <Link href={`/episode/${item.id}`}>
                    <a>{item.title}</a>
                  </Link>
                </td>
                <td>{item.members}</td>
                <td style={{ width: 100}}>{item.publishedAt}</td>
                <td>{item.durationAsString}</td>
                <td>
                  <button type='button'>
                    <img src="/play-green.svg" alt="Tocar episódio"/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

        </table>


      </section>

    </div>
  );
};

export default index;

export const getStaticProps: GetStaticProps = async () => {
  const response = await api.get('episodes', {
    params: {
      _limit: 12,
      _sort: 'published_at',
      _order: 'desc'
    }
  });
  const data = await response.data;

  const episodes = data.map((episode) => {
    return {
      id: episode.id,
      title: episode.title,
      members: episode.members,
      thumbnail: episode.thumbnail,
      publishedAt: format(parseISO(episode.published_at), 'd MMM yy', {locale: ptBR} ),
      description: episode.description,
      url: episode.file.url,
      duration: Number(episode.file.duration),
      durationAsString: converteDurationToTimeString(Number(episode.file.duration))
    }
  })

  const latestEpisodes = episodes.slice(0,2)
  const allEpisodes = episodes.slice(2, episodes.length)

  return {
    props: {
      latestEpisodes,
      allEpisodes
    },
    revalidate: 60 * 60 * 8,
  };
}
