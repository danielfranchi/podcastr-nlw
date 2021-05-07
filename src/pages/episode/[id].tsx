import { useRouter } from 'next/router'
import { GetStaticProps, GetStaticPaths } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { api } from '../../services/api'

import {  format, parseISO} from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'
import converteDurationToTimeString from '../../utils/converteDurationToTimeString'

import styles from './episode.module.scss'

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

interface EpisodeProps {
  episode: Episode
}

const Episode = ({ episode }: EpisodeProps) => {

  const router = useRouter()

  return (
    <div className={styles.episode}>
      <div className={styles.thumbnailContainer}>
        <Link href='/'>
          <button type='button'>
            <img src="/arrow-left.svg" alt="Voltar" />
          </button>
        </Link>

        <Image 
          width={700}
          height={160}
          src={episode.thumbnail}
          objectFit='cover'
        />

        <button>
          <img src="/play.svg" alt="Tocar episódio" />
        </button>
      </div>

      <header>
        <h1>{episode.title}</h1>
        <span>{episode.members}</span>
        <span>{episode.publishedAt}</span>
        <span>{episode.durationAsString}</span>
      </header>

      <div 
        className={styles.description} 
        dangerouslySetInnerHTML={{ __html: episode.description }}
      />
    </div>
  )
}

export default Episode

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking'
  }
}

export const getStaticProps: GetStaticProps = async (ctx) => {
  const { id } = ctx.params

  const { data } = await api.get(`/episodes/${id}`)

  const episode = {
    id: data.id,
    title: data.title,
    members: data.members,
    thumbnail: data.thumbnail,
    publishedAt: format(parseISO(data.published_at), 'd MMM yy', {locale: ptBR} ),
    description: data.description,
    url: data.file.url,
    duration: Number(data.file.duration),
    durationAsString: converteDurationToTimeString(Number(data.file.duration))
  }

  return {
    props: {
      episode,
    },
    revalidate: 60 * 60 * 24
  }
}