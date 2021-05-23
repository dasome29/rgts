import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react'
import { Layout } from '../../components/Layout';
import { usePostQuery, usePostsQuery } from '../../generated/graphql';
import { createUrqlClient } from '../../utils/createUrqlClient';

interface PostProps {

}
const Post: React.FC<PostProps> = ({}) => {
        const router = useRouter()
        const intId :number = typeof router.query.id ==="string" ? parseInt(router.query.id)as number : -1
        const [{data, fetching}, post] = usePostQuery({
            pause : intId === -1,
            variables: {
                id: intId
            }
        })

        if (fetching){
            <Layout>
                <div>loading...</div>
            </Layout>
        }
        return (
            <Layout>
                {data?.post?.text}
            </Layout>
        );
}

export default withUrqlClient(createUrqlClient, {ssr: true})(Post)